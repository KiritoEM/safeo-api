import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { aes256GcmDecrypt, aes256GcmEncrypt, AesGcmPayloadSchema, generateRandomString } from 'src/core/utils/crypto-utils';
import { GenerateAESDekResponse } from './types';

@Injectable()
export class EncryptionKeyService {
    constructor(private configService: ConfigService) { }

    // generate KEK encryption key 
    generateAESKek(): AesGcmPayloadSchema | null {
        const randomKey = generateRandomString(32);
        const masterKey = this.configService.get<string>('encryption.keyMaster');

        if (!masterKey) return null;

        return aes256GcmEncrypt(randomKey, masterKey);
    }

    // generate DEK encryption key
    generateAESDek(kekKey?: string): GenerateAESDekResponse | null {
        const randomKey = generateRandomString(32);

        if (!kekKey) return null;

        return {
            ...aes256GcmEncrypt(randomKey, kekKey),
            DekKey: randomKey
        };
    }

    // decrypt kek
    decryptAESKek(kekKey: string, IV: string, tag: string): string | null {
        const masterKey = this.configService.get<string>('encryption.keyMaster');

        if (!masterKey) return null;

        return aes256GcmDecrypt({
            encrypted: kekKey,
            key: masterKey,
            IV,
            tag
        });
    }
}
