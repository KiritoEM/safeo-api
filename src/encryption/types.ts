import { AesGcmPayloadSchema } from "src/core/utils/crypto-utils";

export type GenerateAESDekResponse = AesGcmPayloadSchema & {
    DekKey: string;
}