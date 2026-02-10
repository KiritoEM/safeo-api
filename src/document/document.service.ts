/* eslint-disable @typescript-eslint/no-unused-vars */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';
import { Inject, Injectable, InternalServerErrorException, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import { DocumentAccessLevelEnum } from 'src/core/enums/document-enums';
import { aes256GcmDecrypt, aes256GcmEncrypt, decomposeEncryptedData, formatEncryptedData } from 'src/core/utils/crypto-utils';
import { EncryptionKeyService } from 'src/encryption/encryption-key.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UserRepository } from 'src/user/user.repository';
import { DocumentRepository } from './document.repository';
import { UserStorageStatusEnum } from 'src/user/enums';
import { getFileType } from 'src/core/utils/file-utils';
import { CreateDocumentSchema, DecryptedDocument, DocumentPublic, GetDocumentsFilterSchema, SharedDocument, UpdateDocumentSchema } from './types';
import { ActivityLogRepository } from 'src/activity-logs/activity-logs.repository';
import { AUDIT_ACTIONS, AUDIT_TARGET } from 'src/activity-logs/constants';
import { MulterFile } from 'src/types/multer';
import { Document } from 'src/drizzle/schemas';

@Injectable()
export class DocumentService {
    constructor(
        private encryptionKeyService: EncryptionKeyService,
        private userRepository: UserRepository,
        private storageService: SupabaseService,
        private documentRepository: DocumentRepository,
        private logRepository: ActivityLogRepository,
        @Inject(CACHE_MANAGER) private cache: cacheManager.Cache,
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
        const KekKeyPayload = decomposeEncryptedData(user.encryptedKey!);

        const kekKey = this.encryptionKeyService.decryptAESKek(
            KekKeyPayload.encrypted as string,
            KekKeyPayload.IV,
            KekKeyPayload.tag
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

        const encryptedMetadataPayload = aes256GcmEncrypt(
            JSON.stringify(metadata),
            DekEncryptionKeyPayload.plainDekKey
        );

        // add file metadata to DB
        const createdDocument = await this.documentRepository.create({
            userId,
            fileName: `${Date.now()}-${file.originalname}`,
            originalName: file.originalname,
            fileSize: file.size,
            fileType: getFileType(file.mimetype) as CreateDocumentSchema['fileType'],
            fileMimeType: file.mimetype,
            encryptedMetadata: formatEncryptedData(encryptedMetadataPayload.IV, encryptedMetadataPayload.encrypted, encryptedMetadataPayload.tag),
            encryptedKey: formatEncryptedData(DekEncryptionKeyPayload.IV, DekEncryptionKeyPayload.encrypted as string, DekEncryptionKeyPayload.tag),
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
            encryptedKey,
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
        const decomposedKekPayload = decomposeEncryptedData(user.encryptedKey!);

        const KekKeyPlain = this.encryptionKeyService.decryptAESKek(
            decomposedKekPayload.encrypted as string,
            decomposedKekPayload.IV,
            decomposedKekPayload.tag
        );

        if (!KekKeyPlain) {
            throw new InternalServerErrorException('Impossible de récupérer la clé de chiffrement Kek');
        }

        const allDocuments = await this.documentRepository.findAll(userId, filterQuery);

        // attach publicURL to document
        const documentsWithPublicUrl = allDocuments.map(async (doc) => (await this.decryptDocumentFile<Document>(KekKeyPlain, doc)) as DocumentPublic);

        // audit log
        await this.logRepository.log({
            action: AUDIT_ACTIONS.GET_ALL_USER_DOCUMENT,
            target: AUDIT_TARGET.DOCUMENT,
            userId,
            ipAddress
        });

        return await Promise.all(documentsWithPublicUrl);
    }

    // get shared documents of an user
    async getSharedDocuments(
        userId: string,
        ipAddress?: string,
        filterQuery?: GetDocumentsFilterSchema
    ): Promise<SharedDocument[]> {
        // get user for encryptionKey KEK
        const user = await this.userRepository.findUserById(userId);

        if (!user) {
            throw new NotFoundException('Utilisateur introuvable');
        }

        // decrypt KEK key
        const decomposedKekPayload = decomposeEncryptedData(user.encryptedKey!);

        const KekKeyPlain = this.encryptionKeyService.decryptAESKek(
            decomposedKekPayload.encrypted as string,
            decomposedKekPayload.IV,
            decomposedKekPayload.tag
        );

        if (!KekKeyPlain) {
            throw new InternalServerErrorException('Impossible de récupérer la clé de chiffrement Kek');
        }

        const sharedDocuments = [
            ...(await this.documentRepository.findSharedDocuments(userId, filterQuery)).map(async (doc) => (await this.decryptDocumentFile<Document>(KekKeyPlain, doc)) as SharedDocument)
        ];
        const receivedDocuments = [
            ...(await this.documentRepository.findReceivedDocuments(userId, filterQuery)).map(async (doc) => (await this.decryptDocumentFile<Document>(KekKeyPlain, doc)) as SharedDocument)
        ];

        // concat sharedDocuments and receivedDocuments
        const allDocuments = await Promise.all([...sharedDocuments, ...receivedDocuments]) as SharedDocument[];

        // sort asc by date
        allDocuments.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        });

        return allDocuments;
    }

    // decrypt image URL of a document and attach it to th document object
    async decryptDocumentFile<T extends Document>(KekKeyPlain: string, doc: T): Promise<DecryptedDocument<T>> {
        // decrypt DEK key
        const decomposedDekPayload = decomposeEncryptedData(doc.encryptedKey);

        const DekKey = this.encryptionKeyService.decryptAESDEK(
            decomposedDekPayload.encrypted as string,
            KekKeyPlain,
            decomposedDekPayload.IV,
            decomposedDekPayload.tag
        );

        // Decrypt metadata
        const decomposedEncryptedMetadataPayload = decomposeEncryptedData(doc.encryptedMetadata);

        const decryptedMetadata = aes256GcmDecrypt({
            encrypted: decomposedEncryptedMetadataPayload.encrypted,
            IV: decomposedEncryptedMetadataPayload.IV,
            tag: decomposedEncryptedMetadataPayload.tag,
            key: DekKey as string
        });

        const { bucketPath } = JSON.parse(decryptedMetadata) as Record<string, string>;

        const {
            encryptedKey,
            encryptedMetadata,
            fileName,
            ...filteredDocument
        } = doc;

        // check if publicURL is cached
        const cachedPublicUrl = await this.cache.get('document:url:' + doc.id) as { publicUrl: string };

        if (!cachedPublicUrl) {
            const publicUrl = await this.storageService.createSignedURL(
                doc.fileMimeType,
                bucketPath,
                60 * 60 * 24
            );

            // cache publicURL 
            await this.cache.set(
                'document:url:' + doc.id,
                { publicUrl },
                60 * 60 * 24
            );

            return { ...filteredDocument, publicUrl };
        }

        return { ...filteredDocument, publicUrl: cachedPublicUrl.publicUrl };
    }

    // update document metadata
    async updateDocumentMetadata(
        userId: string,
        documentId: string,
        data: UpdateDocumentSchema,
        ipAddress?: string
    ): Promise<DocumentPublic> {
        const updatedDocument = await this.documentRepository.update(documentId, userId, data);

        // audit log
        await this.logRepository.log({
            action: AUDIT_ACTIONS.UPDATE_DOCUMENT_ACTION,
            target: AUDIT_TARGET.DOCUMENT,
            userId,
            ipAddress
        });

        return updatedDocument[0];
    }


    // soft delete document
    async deleteDocument(
        userId: string,
        documentId: string,
        ipAddress?: string
    ) {
        //get user by id
        const user = await this.userRepository.findUserById(userId);

        if (!user) {
            throw new NotFoundException('Utilisateur introuvable');
        }

        const deletedDocument = await this.documentRepository.softDelete(documentId, user.id);

        if (deletedDocument.length == 0) {
            throw new InternalServerErrorException('Impossible de supprimer le document');
        }

        // decrease user storage used
        await this.userRepository.update(user.id, { storageUsed: user.storageUsed! - deletedDocument[0].fileSize })

        // audit log
        await this.logRepository.log({
            action: AUDIT_ACTIONS.SOFT_DELETE_DOCUMENT_ACTION,
            target: AUDIT_TARGET.DOCUMENT,
            userId,
            ipAddress
        });
    }
}