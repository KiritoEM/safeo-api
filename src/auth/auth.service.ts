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
import { LoginSchema, SignupSchema } from './types';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userRepository: UserRepository,
    private mailService: MailService,
    private otpService: OtpService,
    @Inject(CACHE_MANAGER) private cache: cacheManager.Cache,
  ) {}

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

    const cacheParam = {
      id: user.id,
      email: user.email,
      verificationToken,
    };

    //set logged user into cache to use it in 2FA verification
    try {
      await this.cache.set(
        'auth:login:' + verificationToken,
        cacheParam,
        30 * 60 * 1000,
      ); // 30 minutes
    } catch (err) {
      this.logger.error('Failed to cache user: ', err);
      throw new InternalServerErrorException();
    }

    return {
      ...user,
      verificationToken,
    };
  }

  async sendLoginOTP(userEmail: string, userId: string) {
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

  async verifyLoginOTP(otpCode: string, verificationToken: string) {
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

  async checkIfUserExists(email: string): Promise<User | null> {
    return await this.userRepository.findUserByEmail(email);
  }

  async sendSignupOTP(data: SignupSchema) {
    const verificationToken = generateRandomString(32);

    const cacheParam = {
      ...data,
      password: await hashPassword(data.password),
      verificationToken,
    };

    //set user into catch to use when creating user later
    try {
      await this.cache.set(
        'auth:signup:' + verificationToken,
        cacheParam,
        30 * 60 * 1000,
      ); // 30 minutes
    } catch (err) {
      this.logger.error('Failed to cache user: ', err);
      throw new InternalServerErrorException();
    }

    // generate OTP code
    const otpCode = await this.otpService.generateOTPCode({
      expiresIn: 5 * 60, // 5 minutes
      metadata: { email: data.email },
    });

    //send otp code to user
    try {
      await this.mailService.sendEmail({
        subject: 'Confirmation de la création de votre compte Safeo',
        to: data.email,
        template: 'signup-otp',
        context: {
          otpCode: otpCode,
          expirationMinutes: 5,
          name:
            data.fullName.split(' ').length > 0
              ? data.fullName.split(' ')[0]
              : data.fullName,
        },
      });
    } catch (err) {
      this.logger.error('Failed to send OTP to user: ', err);
      throw new InternalServerErrorException(
        "Impossible d'envoyer le code de vérification à votre adresse email.",
      );
    }

    return {
      verificationToken,
    };
  }

  async verifySignupOTP(otpCode: string, verificationToken: string) {
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
