import { BaseApiReturn } from 'src/core/interfaces';
import { User } from 'src/drizzle/schemas';

// Params schemas
export type LoginSchema = Required<Pick<User, 'email' | 'password'>>;

export type SignupSchema = Required<Pick<User, 'email' | 'fullName'>> & {
  password: string;
};

// Response schemas
export interface IloginResponse extends BaseApiReturn {
  verificationToken: string;
}

export interface Iverify2FAResponse extends BaseApiReturn {
  accessToken: string;
}

export interface ISignupSendOtpResponse extends BaseApiReturn {
  verificationToken: string;
}

// cached params types
export type CachedUserLogin = {
  id: string;
  email: string;
  verificationToken: string;
};

export type CachedUserSignup = SignupSchema & {
  verificationToken: string;
};

// send signup email params
export type SendSignupEmailParams = {
  email: string;
  otpCode: string;
  name: string;
};


// send login email params
export type SendLoginEmailParams = {
  email: string;
  otpCode: string;
};
