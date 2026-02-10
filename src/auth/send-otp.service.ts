import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { SendLoginEmailParams, SendSignupEmailParams } from './types';

@Injectable()
export class SendOtpService {
  private readonly logger = new Logger(SendOtpService.name);

  constructor(private mailService: MailService) { }

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
        "Impossible d'envoyer le code de vérification à votre adresse email",
      );
    }
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
        "Impossible d'envoyer le code de vérification à votre adresse email",
      );
    }
  }
}
