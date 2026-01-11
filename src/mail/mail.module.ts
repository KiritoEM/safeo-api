import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailOptions } from 'src/core/configs/mail.config';

@Module({
  imports: [MailerModule.forRootAsync(mailOptions)],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
