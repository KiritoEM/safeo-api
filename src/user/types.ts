import { BaseApiReturn } from 'src/core/interfaces';

// Params schemas
export type CreateUserWithAccountSchema = {
  email: string;
  fullName: string;
  type: string;
  provider: string;
  accessToken: string;
  expiresAt: string;
  scope: string;
  idToken: string;
  tokenType: string;
  sessionState: string;
  providerAccountId: string;
  encryptionKey?: string;
  encryptionIv?: string;
  encryptionTag?: string;
};

export type CreateUserSchema = Pick<
  CreateUserWithAccountSchema,
  'email' | 'fullName' | 'encryptionKey' | 'encryptionIv' | 'encryptionTag'
> & {
  password: string;
};
export type UpdateAccountSchema = Pick<
  CreateUserWithAccountSchema,
  | 'accessToken'
  | 'expiresAt'
  | 'tokenType'
  | 'scope'
  | 'idToken'
  | 'sessionState'
>;

export type UpdateUser = Partial<{
  email: string;
  fullName: string;
  refreshToken: string | null;
}>;

// Response schemas
export interface AuthorizeUrlResponse extends BaseApiReturn {
  authUrl: string;
}

export interface ExchangeTokenResponse extends BaseApiReturn {
  accessToken: string;
  refreshToken: string;
}

export type PKCEGeneratorResponse = {
  codeVerifier: string;
  codeChallenge: string;
};
