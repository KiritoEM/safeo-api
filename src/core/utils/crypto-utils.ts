import { randomBytes, subtle } from 'crypto';

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
