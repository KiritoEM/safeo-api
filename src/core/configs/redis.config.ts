import { registerAs } from '@nestjs/config';
import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME || 'default',
}));

export const redisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const host = configService.get<string>('redis.host');
    const port = configService.get<number>('redis.port');
    const password = configService.get<string>('redis.password');
    const username = configService.get<string>('redis.username');
    const credentials = password ? `${username}:${password}@` : '';

    const redisUrl = `redis://${credentials}${host}:${port}`;

    return {
      stores: [
        new KeyvRedis({
          url: redisUrl,
        }),
      ],
    };
  },
  inject: [ConfigService],
};
