import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { OtpModule } from 'src/otp/otp.module';
import { SendOtpService } from './send-otp.service';
import { ActivityLogsModule } from 'src/activity-logs/activity-logs.module';
import { EncryptionModule } from 'src/encryption/encryption.module';

@Module({
  providers: [AuthService, SendOtpService],
  controllers: [AuthController],
  imports: [UserModule, MailModule, OtpModule, ActivityLogsModule, EncryptionModule],
})
export class AuthModule { }
