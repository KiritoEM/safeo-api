import { randomBytes, subtle, createCipheriv, createDecipheriv } from 'crypto';

export type AesGcmDecryptSchema = {
  encrypted: string;
  key: string;
  IV: string;
  tag: string;
};

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
    key: key,
    IV: IV.toString('hex'),
    tag: tag.toString('hex'),
  };
};

export const aes256GcmDecrypt = (params: AesGcmDecryptSchema): string => {
  const decipher = createDecipheriv(
    'aes-256-gcm',
    params.key,
    Buffer.from(params.IV, 'hex'),
  );

  decipher.setAuthTag(Buffer.from(params.tag, 'hex'));

  let decrypted = decipher.update(params.encrypted, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
};
