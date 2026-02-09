import { randomBytes, subtle, createCipheriv, createDecipheriv } from 'crypto';
import { Readable } from 'stream';

export type AesGcmPayloadSchema = {
  encrypted: string | Buffer<ArrayBuffer>;
  IV: string;
  tag: string;
};

export type AesGcmParamsSchema = AesGcmPayloadSchema & {
  key: string;
}

export const generateRandomString = (length: number = 128) => {
  return randomBytes(length).toString('hex');
};

export const convertIntoSha256 = (plain: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);

  return subtle.digest('SHA-256', data);
};

export const dec2hex = (dec: number) => {
  return ('0' + dec.toString(16)).substr(-2);
};

export const base64urlencode = (data: ArrayBuffer): string => {
  let str = '';
  const bytes = new Uint8Array(data);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const aes256GcmEncrypt = (plainText: string, key: string) => {
  const IV = randomBytes(16);
  const keyBuffer = Buffer.from(key, 'hex');

  const cipher = createCipheriv('aes-256-gcm', keyBuffer, IV);

  let encrypted = cipher.update(plainText, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return {
    encrypted,
    IV: IV.toString('hex'),
    tag: tag.toString('hex'),
  };
};

export const aes256GcmDecrypt = (params: AesGcmParamsSchema): string => {
  const keyBuffer = Buffer.from(params.key, 'hex');

  const decipher = createDecipheriv(
    'aes-256-gcm',
    keyBuffer,
    Buffer.from(params.IV, 'hex'),
  );

  decipher.setAuthTag(Buffer.from(params.tag, 'hex'));

  let decrypted = decipher.update(params.encrypted as string, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
};

export const aes256GcmEncryptBuffer = (buffer: Buffer, key: string): Promise<AesGcmPayloadSchema> => {
  const IV = randomBytes(16);
  const keyBuffer = Buffer.from(key, 'hex');

  const cipher = createCipheriv('aes-256-gcm', keyBuffer, IV);

  // transform buffer into streams
  const readable = Readable.from(buffer);
  const chunks: Buffer[] = [];

  // pip cipher to create encrypted file
  return new Promise((resolve, reject) => {
    readable
      .pipe(cipher)
      .on('data', (chunk) => chunks.push(chunk))
      .on('end', () => {
        const encrypted = Buffer.concat(chunks);
        const tag = cipher.getAuthTag();

        resolve({
          encrypted,
          IV: IV.toString('hex'),
          tag: tag.toString('hex'),
        })
      })
      .on('error', reject)
  })
};

export const formatEncryptedData = (IV: string, encrytped: string, tag: string): string => `${IV}:${encrytped}:${tag}`;

export const decomposeEncryptedData = (encrypted: string): AesGcmPayloadSchema => {
  const decomposedEncrypted: string[] = encrypted.split(':');

  return {
    IV: decomposedEncrypted[0],
    encrypted: decomposedEncrypted[1],
    tag: decomposedEncrypted[2]
  }
};
