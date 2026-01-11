import { Inject, Injectable } from '@nestjs/common';
import * as cacheManager from 'cache-manager';
import * as types from './types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { OTP_GENERATOR } from './constants';

type OTPParams = {
  expiresIn?: number;
  metadata?: Record<string, string>;
};

@Injectable()
export class OtpService {
  private otpGenerator: types.IOTPGenerator;

  constructor(
    @Inject(OTP_GENERATOR) otpGenerator: types.IOTPGenerator,
    @Inject(CACHE_MANAGER) private cache: cacheManager.Cache,
  ) {
    this.otpGenerator = otpGenerator;
  }

  async generateOTPCode(
    params: OTPParams = { expiresIn: 5 * 60, metadata: {} },
  ): Promise<string> {
    const code = this.otpGenerator.generate(6);

    const cacheParam: Record<string, any> = {
      code,
      expiresIn: params.expiresIn! * 1000, //5 minutes
      ...params.metadata,
    };

    const uniqueKey = `otp:${code}`;

    await this.cache.set(uniqueKey, cacheParam, params.expiresIn! * 1000);

    return code;
  }

  async verifyOtp(otpCode: string): Promise<types.verifyOtpResponse> {
    const uniqueKey = `otp:${otpCode}`;
    const cacheParam = await this.cache.get(uniqueKey);

    if (!cacheParam) {
      return {
        reason: 'CODE_EXPIRED',
        isValid: false,
      };
    }

    const cachedOtpCode = cacheParam['code'] as string;
    const isMatched = Number(otpCode) === Number(cachedOtpCode);

    // delete code from cache if   matched
    if (isMatched) {
      await this.cache.del(uniqueKey);
    }

    return {
      reason: isMatched ? 'SUCCESS' : 'WRONG_CODE',
      isValid: isMatched,
    };
  }
}
