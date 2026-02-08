/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, InternalServerErrorException, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import { DocumentAccessLevelEnum } from 'src/core/enums/document-enums';
import { aes256GcmDecrypt, aes256GcmEncrypt } from 'src/core/utils/crypto-utils';
import { EncryptionKeyService } from 'src/encryption/encryption-key.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UserRepository } from 'src/user/user.repository';
import { DocumentRepository } from './document.repository';
import { UserStorageStatusEnum } from 'src/user/enums';
import { getFileType } from 'src/core/utils/file-utils';
import { CreateDocumentSchema, DocumentPublic, GetDocumentsFilterSchema } from './types';
import { ActivityLogRepository } from 'src/activity-logs/activity-logs.repository';
import { AUDIT_ACTIONS, AUDIT_TARGET } from 'src/activity-logs/constants';
import { MulterFile } from 'src/types/multer';

@Injectable()
export class DocumentService {
    constructor(
        private encryptionKeyService: EncryptionKeyService,
        private userRepository: UserRepository,
        private storageService: SupabaseService,
        private documentRepository: DocumentRepository,
        private logRepository: ActivityLogRepository
    ) { }

    // upload document
    async uploadFile(
        accessLevel: DocumentAccessLevelEnum,
        file: MulterFile,
        userId: string,
        ipAddress?: string
    ): Promise<DocumentPublic> {
        // get user for encryptionKey KEK
        const user = await this.userRepository.findUserById(userId);

        if (!user) {
            throw new NotFoundException('Utilisateur introuvable');
        }

        // check if user has enough space to store this file or space is full
        const spaceStatus = await this.userRepository.checkStorageStatus(user.id, file.size);

        if (spaceStatus == UserStorageStatusEnum.INSUFFICIENT) {
            throw new PayloadTooLargeException('Espace insuffisant pour mettre le fichier dans le cloud');
        }
        else if (spaceStatus == UserStorageStatusEnum.FULL) {
            throw new PayloadTooLargeException('Espace utilisateur plein');
        }

        // decrypt KEK key
        const kekKey = this.encryptionKeyService.decryptAESKek(
            user.encryptionKey!,
            user.encryptionIv!,
            user.encryptionTag!
        );

        if (!kekKey) {
            throw new InternalServerErrorException('Impossible de récupérer la clé de chiffrement Kek');
        }

        // generate DEK encryption key
        const DekEncryptionKeyPayload = this.encryptionKeyService.generateAESDek(kekKey);

        if (!DekEncryptionKeyPayload) {
            throw new InternalServerErrorException('Impossible de créér la clé de chiffrement');
        }

        // upload file to cloud
        const { fullPath, path } = await this.storageService.uploadFile({
            file: file.buffer as Buffer,
            originalFileName: file.originalname,
            fileMimetype: file.mimetype,
        });

        // Encrypt bucketPath and filPath
        const metadata = {
            fullPath,
            bucketPath: path
        };

        const { encrypted, IV, tag } = aes256GcmEncrypt(
            JSON.stringify(metadata),
            DekEncryptionKeyPayload.DekKey
        );

        // add file metadata to DB
        const createdDocument = await this.documentRepository.create({
            userId,
            fileName: `${Date.now()}-${file.originalname}`,
            originalName: file.originalname,
            fileSize: file.size,
            fileType: getFileType(file.mimetype) as CreateDocumentSchema['fileType'],
            fileMimeType: file.mimetype,
            encryptedMetadata: {
                encrypted,
                IV,
                tag
            },
            encryptionKey: DekEncryptionKeyPayload.encrypted as string,
            encryptionIv: DekEncryptionKeyPayload.IV,
            encryptionTag: DekEncryptionKeyPayload.tag,

            accessLevel,
            filePath: `${Date.now()}-${file.originalname}`
        });

        if (createdDocument.length == 0) {
            throw new InternalServerErrorException("Impossible d'uploader le document");
        }

        // update user storage used
        await this.userRepository.update(user.id, {
            storageUsed: user.storageUsed! + file.size
        });

        const {
            encryptionKey,
            encryptionIv,
            encryptionTag,
            encryptedMetadata,
            fileName,
            ...filteredDocument
        } = createdDocument[0];

        // audit log
        await this.logRepository.log({
            action: AUDIT_ACTIONS.CREATE_DOCUMENT_ACTION,
            target: AUDIT_TARGET.DOCUMENT,
            userId,
            ipAddress
        });

        return filteredDocument;
    }

    // get all documents
    async getAllDocuments(
        userId: string,
        ipAddress?: string,
        filterQuery?: GetDocumentsFilterSchema
    ): Promise<DocumentPublic[]> {
        // get user for encryptionKey KEK
        const user = await this.userRepository.findUserById(userId);

        if (!user) {
            throw new NotFoundException('Utilisateur introuvable');
        }

        // decrypt KEK key
        const KekKey = this.encryptionKeyService.decryptAESKek(
            user.encryptionKey!,
            user.encryptionIv!,
            user.encryptionTag!
        );

        if (!KekKey) {
            throw new InternalServerErrorException('Impossible de récupérer la clé de chiffrement Kek');
        }

        const allDocuments = await this.documentRepository.fetchAll(userId, filterQuery);

        // add publicURL for all document file
        const documentsWithPublicUrl = allDocuments.map(async (doc) => {
            // decrypt DEK key
            const DekKey = this.encryptionKeyService.decryptAESDEK(
                doc.encryptionKey as string,
                KekKey,
                doc.encryptionIv as string,
                doc.encryptionTag as string
            );

            // Get encrypted metadata
            const metadata = doc.encryptedMetadata as {
                encrypted: string;
                IV: string;
                tag: string
            };

            // Decrypt metadata
            const decryptedMetadata = aes256GcmDecrypt({
                encrypted: metadata.encrypted,
                IV: metadata.IV,
                tag: metadata.tag,
                key: DekKey as string
            });

            const { bucketPath } = JSON.parse(decryptedMetadata) as Record<string, string>;

            const {
                encryptionKey,
                encryptionIv,
                encryptionTag,
                encryptedMetadata: _,
                fileName,
                ...filteredDocument
            } = doc;

            // get public URL
            const publicUrl = await this.storageService.createSignedURL(
                doc.fileMimeType as string,
                bucketPath,
                60 * 60 * 24
            );

            return { ...filteredDocument, publicUrl } as DocumentPublic;
        });

        // audit log
        await this.logRepository.log({
            action: AUDIT_ACTIONS.GET_ALL_USER_DOCUMENT,
            target: AUDIT_TARGET.DOCUMENT,
            userId,
            ipAddress
        });

        return await Promise.all(documentsWithPublicUrl);
    }
}