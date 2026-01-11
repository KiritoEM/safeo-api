import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [UserModule, MailModule, OtpModule],
})
export class AuthModule {}
