import { BaseApiReturn } from 'src/core/interfaces';
import { UserPublic } from 'src/user/types';

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
