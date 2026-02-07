import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { aes256GcmEncrypt, AesGcmDecryptSchema, generateRandomString } from 'src/core/utils/crypto-utils';

@Injectable()
export class EncryptionService {
    constructor(private configService: ConfigService) { }

    generateAESKek(): AesGcmDecryptSchema | null {
        const randomKey = generateRandomString(32);
        const masterKey = this.configService.get<string>('encryption.keyMaster');

        if (!masterKey) return null;

        return aes256GcmEncrypt(randomKey, masterKey);
    }
}
