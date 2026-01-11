import { registerAs } from '@nestjs/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET_KEY,
}));

export const jwtOptions: JwtModuleAsyncOptions = {
  global: true,
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('jwt.secret'),
    signOptions: { expiresIn: '1d' },
  }),
  inject: [ConfigService],
};
