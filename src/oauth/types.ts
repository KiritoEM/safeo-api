import { BaseApiReturn } from 'src/core/interfaces';
import { User } from 'src/drizzle/schemas';

// Response schemas
export interface AuthorizeUrlResponse extends BaseApiReturn {
  authUrl: string;
}

export interface ExchangeTokenResponse extends BaseApiReturn {
  accessToken: string;
  refreshToken: string;
}

export interface IGetUserInfoResponse extends BaseApiReturn {
  user?: UserPublic;
}

export type PKCEGeneratorResponse = {
  codeVerifier: string;
  codeChallenge: string;
};
