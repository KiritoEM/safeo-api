import { randomInt } from 'crypto';
import { IOTPGenerator } from '../types';

export class OTPDigitsGenerator implements IOTPGenerator {
  private readonly pattern = '0123456789';

  generate(length: number): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += this.pattern[randomInt(0, this.pattern.length)];
    }
    return otp;
  }
}
