import { getRandomValues } from 'crypto';
import { base64urlencode, convertIntoSha256, dec2hex } from './crypto-utils';

export const generateCodeVerifier = () => {
  const array = new Uint32Array(56 / 2);
  getRandomValues(array);

  return Array.from(array, dec2hex).join('');
};

export const generateCodeChallenge = async (
  codeVerifier: string,
): Promise<string> => {
  const hashed = await convertIntoSha256(codeVerifier);
  const base64Encoded = base64urlencode(hashed);

  return base64Encoded;
};
