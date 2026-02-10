import { AesGcmPayloadSchema } from 'src/core/utils/crypto-utils';

export type GenerateAESDekResponse = AesGcmPayloadSchema & {
  plainDekKey: string;
};
