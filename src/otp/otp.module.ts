import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OTPDigitsGenerator } from './helpers/otp-generator';
import { OTP_GENERATOR } from './constants';

@Module({
  providers: [
    OtpService,
    OTPDigitsGenerator,
    {
      provide: OTP_GENERATOR,
      useClass: OTPDigitsGenerator,
    },
  ],
  exports: [OtpService],
})
export class OtpModule {}
