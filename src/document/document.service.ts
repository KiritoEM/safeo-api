/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DocumentAccessLevelEnum } from 'src/core/enums/document-enums';
import { aes256GcmEncryptBuffer } from 'src/core/utils/crypto-utils';
import { EncryptionKeyService } from 'src/encryption/encryption-key.service';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class DocumentService {
    constructor(
        private encryptionKeyService: EncryptionKeyService,
        private userRepository: UserRepository
    ) { }

    async uploadFile(accessLevel: DocumentAccessLevelEnum, file: Express.Multer.File, userId: string) {
        // get user for encryptionKey
        const user = await this.userRepository.findUserById(userId);

        if (!user) {
            throw new NotFoundException('Utilisateur introuvable');
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
        const { encrypted: encryptedFile, IV, tag } = await aes256GcmEncryptBuffer(file.buffer, DekEncryptionPayload.DekKey);

        console.log(encryptedFile);
    }
}
