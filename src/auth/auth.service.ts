import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';
import { comparePassword, hashPassword } from 'src/core/utils/hashing_utils';
import { User } from 'src/drizzle/schemas';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from 'src/otp/otp.service';
import { generateRandomString } from 'src/core/utils/crypto-utils';
import {
  CachedUserLogin,
  CachedUserSignup,
  LoginSchema,
  SendLoginEmailParams,
  SendSignupEmailParams,
  SignupSchema,
} from './types';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userRepository: UserRepository,
    private mailService: MailService,
    private otpService: OtpService,
    @Inject(CACHE_MANAGER) private cache: cacheManager.Cache,
  ) { }

  // login user
  async login(
    data: LoginSchema,
  ): Promise<User & { verificationToken: string }> {
    // check if user exists in database
    const user = await this.userRepository.findUserByEmail(data.email);

    if (!user) {
      throw new NotFoundException('Aucun utilisateur trouvé avec cet email.');
    }

    // check if user has already 0auth account
    if (user.account) {
      throw new ConflictException(
        `Ce compte existe déja, vous devez vous connecter avec le provider ${user.account.provider}.`,
      );
    }

    if (!(await comparePassword(data.password!, user.password!))) {
      throw new UnauthorizedException(
        'Mot de passe incorrect. Veuillez réessayer.',
      );
    }

    const verificationToken = generateRandomString(32);

    const cacheParam: CachedUserLogin = {
      id: user.id,
      email: user.email,
      verificationToken,
    };

    //set logged user into cache to use it in 2FA verification
    await this.cache.set(
      'auth:login:' + verificationToken,
      cacheParam,
      30 * 60 * 1000,
    ); // 30 minutes

    return {
      ...user,
      verificationToken,
    };
  }

  // send login email utility
  async sendLoginEmail(data: SendLoginEmailParams) {
    try {
      await this.mailService.sendEmail({
        subject: 'Confirmation de connexion',
        to: data.email,
        template: 'login-otp',
        context: {
          otpCode: data.otpCode,
          expirationMinutes: 5,
        },
      });
    } catch (err) {
      this.logger.error('Failed to send OTP to user: ', err);
      throw new InternalServerErrorException(
        "Impossible d'envoyer le code de vérification à votre adresse email.",
      );
    }
  }


  // send login OTP
  async sendLoginOTP(userEmail: string, userId: string) {
    // generate OTP code
    const otpCode = await this.otpService.generateOTPCode({
      expiresIn: 5 * 60, // 5 minutes
      metadata: { userId, email: userEmail },
    });

    try {
      await this.mailService.sendEmail({
        subject: 'Confirmation de connexion',
        to: userEmail,
        template: 'login-otp',
        context: {
          otpCode,
          expirationMinutes: 5,
        },
      });
    } catch (err) {
      this.logger.error('Failed to send OTP to user: ', err);
      throw new InternalServerErrorException(
        "Impossible d'envoyer le code de vérification à votre adresse email.",
      );
    }
  }

  // Resend OTP verification for login
  async resendLoginOTP(verificationToken: string): Promise<{ verificationToken: string }> {
    const newVerificationToken = generateRandomString(32);

    // get cached user info
    const cacheParam = (await this.cache.get(
      'auth:login:' + verificationToken,
    )) as CachedUserLogin;

    if (!cacheParam) {
      throw new UnauthorizedException(
        'Session expirée. Veuillez vous reconnecter.',
      );
    }

    // generate new code OTP
    const otpCode = await this.otpService.generateOTPCode({
      expiresIn: 5 * 60, // 5 minutes
      metadata: { userId: cacheParam.id, email: cacheParam.email },
    });


    //set user into cache with new verification token
    await this.cache.set(
      'auth:login:' + newVerificationToken,
      cacheParam,
      30 * 60 * 1000,
    ); // 30 minutes

    // Delete old verification token from cache
    await this.cache.del('auth:login:' + verificationToken);

    await this.sendLoginEmail({ email: cacheParam.email, otpCode });

    return {
      verificationToken: newVerificationToken
    }
  }

  // veritify login OTP code
  async verifyLoginOTP(
    otpCode: string,
    verificationToken: string,
  ): Promise<Pick<CachedUserLogin, 'id' | 'email'>> {
    // get cached user info
    const cacheParam = await this.cache.get('auth:login:' + verificationToken);

    if (!cacheParam) {
      throw new UnauthorizedException(
        'Session expirée. Veuillez vous reconnecter.',
      );
    }

    const isOtpCodeValid = await this.otpService.verifyOtp(otpCode);

    if (!isOtpCodeValid.isValid) {
      throw new UnauthorizedException(
        isOtpCodeValid.reason == 'WRONG_CODE'
          ? 'Code de connexion incorrect. Veuillez réessayer.'
          : 'Code de connexion expiré. Veuillez vous reconnecter.',
      );
    }

    return {
      id: cacheParam['id'] as string,
      email: cacheParam['email'] as string,
    };
  }

  // check if user already exist in database
  async checkIfUserExists(email: string): Promise<User | null> {
    return await this.userRepository.findUserByEmail(email);
  }

  // send signup email utility
  async sendSignupEmail(data: SendSignupEmailParams) {
    try {
      await this.mailService.sendEmail({
        subject: 'Confirmation de la création de votre compte Safeo',
        to: data.email,
        template: 'signup-otp',
        context: {
          otpCode: data.otpCode,
          expirationMinutes: 5,
          name:
            data.name.split(' ').length > 0
              ? data.name.split(' ')[0]
              : data.name,
        },
      });
    } catch (err) {
      this.logger.error('Failed to send OTP to user: ', err);
      throw new InternalServerErrorException(
        "Impossible d'envoyer le code de vérification à votre adresse email.",
      );
    }
  }

  // send signup OTP email
  async sendSignupOTP(
    data: SignupSchema,
  ): Promise<{ verificationToken: string }> {
    const verificationToken = generateRandomString(32);

    const cacheParam = {
      ...data,
      password: await hashPassword(data.password),
      verificationToken,
    } as CachedUserSignup;

    //set user into catch to use when creating user later
    await this.cache.set(
      'auth:signup:' + verificationToken,
      cacheParam,
      30 * 60 * 1000,
    ); // 30 minutes

    // generate OTP code
    const otpCode = await this.otpService.generateOTPCode({
      expiresIn: 5 * 60, // 5 minutes
      metadata: { email: data.email },
    });

    // send otp code
    await this.sendSignupEmail({
      email: data.email,
      name: data.fullName,
      otpCode: otpCode,
    });

    return {
      verificationToken,
    };
  }

  // Resend OTP verification for signup
  async resendSignupOTP(
    verificationToken: string,
  ): Promise<{ verificationToken: string }> {
    const newVerificationToken = generateRandomString(32);

    // get cached user info
    const cacheParam = (await this.cache.get(
      'auth:signup:' + verificationToken,
    )) as CachedUserSignup;

    if (!cacheParam) {
      throw new UnauthorizedException(
        'Session expirée. Veuillez vous reinscrire.',
      );
    }

    //set user into cache with new verification token
    await this.cache.set(
      'auth:signup:' + newVerificationToken,
      cacheParam,
      30 * 60 * 1000,
    ); // 30 minutes


    // Delete old verification token from cache
    await this.cache.del('auth:signup:' + verificationToken);


    // generate new OTP code
    const newOtpCode = await this.otpService.generateOTPCode({
      expiresIn: 5 * 60, // 5 minutes
      metadata: { email: cacheParam.email },
    });

    // send otp code
    await this.sendSignupEmail({
      email: cacheParam.email,
      name: cacheParam.fullName,
      otpCode: newOtpCode,
    });

    return {
      verificationToken: newVerificationToken,
    };
  }

  // verify signupt OTP
  async verifySignupOTP(
    otpCode: string,
    verificationToken: string,
  ): Promise<SignupSchema> {
    // get cached user info
    const cacheParam = await this.cache.get('auth:signup:' + verificationToken);

    if (!cacheParam) {
      throw new UnauthorizedException(
        'Session expirée. Veuillez vous reinscrire.',
      );
    }

    const isOtpCodeValid = await this.otpService.verifyOtp(otpCode);

    if (!isOtpCodeValid.isValid) {
      throw new UnauthorizedException(
        isOtpCodeValid.reason == 'WRONG_CODE'
          ? 'Code de connexion incorrect. Veuillez réessayer.'
          : 'Code de connexion expiré. Veuillez vous reconnecter.',
      );
    }

    // delete otp code and user from cache
    await this.cache.del('auth:signup:' + verificationToken);

    return cacheParam as SignupSchema;
  }

  async createNewUser(data: SignupSchema): Promise<User[]> {
    return await this.userRepository.createUser(data);
  }
}
