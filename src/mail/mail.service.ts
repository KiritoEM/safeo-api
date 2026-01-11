import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private mailService: MailerService) {}

  async sendEmail(params: {
    to: string;
    subject: string;
    template: string;
    context?: ISendMailOptions['context'];
  }): Promise<SentMessageInfo> {
    const sendMailParams: Record<string, string | Record<string, any>> = {
      to: params.to,
      subject: params.subject,
      template: params.template,
      context: params.context || {},
    };

    return (await this.mailService.sendMail(
      sendMailParams,
    )) as Promise<SentMessageInfo>;
  }
}
