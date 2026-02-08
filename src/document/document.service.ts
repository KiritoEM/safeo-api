/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, InternalServerErrorException, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import { DocumentAccessLevelEnum } from 'src/core/enums/document-enums';
import { aes256GcmEncryptBuffer } from 'src/core/utils/crypto-utils';
import { EncryptionKeyService } from 'src/encryption/encryption-key.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UserRepository } from 'src/user/user.repository';
import { DocumentRepository } from './document.repository';
import { UserStorageStatusEnum } from 'src/user/enums';
import { getFileType } from 'src/core/utils/file-utils';
import { FileTypeEnum } from 'src/core/enums/file-enums';
import { CreateDocumentSchema, PublicDocument } from './types';
import { ActivityLogRepository } from 'src/activity-logs/activity-logs.repository';
import { AUDIT_ACTIONS, AUDIT_TARGET } from 'src/activity-logs/constants';

@Injectable()
export class DocumentService {
    constructor(
        private encryptionKeyService: EncryptionKeyService,
        private userRepository: UserRepository,
        private storageService: SupabaseService,
        private documentRepository: DocumentRepository,
        private logRepository: ActivityLogRepository
    ) { }

    async uploadFile(
        accessLevel: DocumentAccessLevelEnum,
        file: Express.Multer.File,
        userId: string,
        ipAddress?: string
    ): Promise<PublicDocument> {
        // get user for encryptionKey
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

        // decrypt KEK key and generate DEK encryption key
        const kekKey = this.encryptionKeyService.decryptAESKek(user.encryptionKey!, user.encryptionIv!, user.encryptionTag!);

        if (!kekKey) {
            throw new InternalServerErrorException('Impossible de récupérer la clé de chiffrement Kek');
        }

        const DekEncryptionPayload = this.encryptionKeyService.generateAESDek(kekKey);

        if (!DekEncryptionPayload) {
            throw new InternalServerErrorException('Impossible de créér la clé de chiffrement');
        }

        // encrypt uploaded file
        const { encrypted: encryptedFile } = await aes256GcmEncryptBuffer(file.buffer, DekEncryptionPayload.DekKey);

        // upload file to cloud
        const { fullPath, path } = await this.storageService.uploadFile({
            file: encryptedFile as Buffer,
            originalFileName: file.originalname as string,
            fileMimetype: file.mimetype as string,
        });

        // add file metadata to DB
        const createdDocument = await this.documentRepository.create({
            userId,
            fileName: `${Date.now()}-${file.originalname as string}`,
            originalName: file.originalname as string,
            fileSize: file.size as number,
            fileType: (FileTypeEnum[(getFileType(file.mimetype)) as string]) as CreateDocumentSchema['fileType'],
            fileMimeType: file.mimetype as string,
            filePath: fullPath,
            bucketPath: path,
            encryptionKey: DekEncryptionPayload.encrypted as string,
            encryptionIv: DekEncryptionPayload.IV,
            encryptionTag: DekEncryptionPayload.tag,
            accessLevel
        });

        if (createdDocument.length == 0) {
            throw new InternalServerErrorException("Impossible d'uploader le document");
        }

        // update user storage used
        await this.userRepository.updateUser({
            storageUsed: (user.storageUsed! + file.size) as number
        });

        const { encryptionKey, encryptionIv, bucketPath, fileName, encryptionTag, ...filteredDocument } = createdDocument[0];

        // audit log
        await this.logRepository.log(
            {
                action: AUDIT_ACTIONS.CREATE_DOCUMENT_ACTION,
                target: AUDIT_TARGET.DOCUMENT,
                userId,
                ipAddress
            }
        )

        return filteredDocument;
    }
}
