import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { OtpModule } from 'src/otp/otp.module';
import { SendOtpService } from './send-otp.service';
import { EncryptionKeyModule } from 'src/encryption/encryption-key.module';
import { JwtUtilsService } from 'src/jwt/jwt-utils.service';

@Module({
  providers: [AuthService, SendOtpService, JwtUtilsService],
  controllers: [AuthController],
  imports: [
    forwardRef(() => UserModule),
    MailModule,
    OtpModule,
    EncryptionKeyModule,
  ],
  exports: [AuthService]
})
export class AuthModule { }
