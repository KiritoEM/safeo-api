import { BaseApiReturn } from 'src/core/interfaces';
import { User } from 'src/drizzle/schemas';

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
  encryptedKey?: string;
};

export type CreateUserSchema = Pick<
  CreateUserWithAccountSchema,
  'email' | 'fullName' | 'encryptedKey'
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

export type UpdateUserSchema = Partial<{
  email: string;
  fullName: string;
  refreshToken: string | null;
  storageUsed?: number;
}>;

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

export type UserPublic = Omit<
  User,
  'encryptedKey' | 'refreshToken' | 'password'
>;
