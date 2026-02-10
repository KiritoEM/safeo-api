import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DrizzleModule } from './drizzle/drizzle.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import oauthConfig from './core/configs/oauth.config';
import dbConfig from './core/configs/db.config';
import redisConfig, { redisOptions } from './core/configs/redis.config';
import { MailModule } from './mail/mail.module';
import { OauthModule } from './oauth/oauth.module';
import jwtConfig, { jwtOptions } from './core/configs/jwt.config';
import { OtpModule } from './otp/otp.module';
import { AccountModule } from './account/account.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { EncryptionKeyModule } from './encryption/encryption-key.module';
import { DocumentModule } from './document/document.module';
import { SupabaseModule } from './supabase/supabase.module';
import mailConfig from './core/configs/mail.config';
import encryptionConfig from './core/configs/encryption.config';
import supabaseConfig from './core/configs/supabase.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DocumentSharesModule } from './document-shares/document-shares.module';
import { JwtUtilsModule } from './jwt-utils/jwt-utils.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        oauthConfig,
        dbConfig,
        redisConfig,
        mailConfig,
        jwtConfig,
        encryptionConfig,
        supabaseConfig
      ],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      }
    ]),
    OauthModule,
    DrizzleModule,
    UserModule,
    AuthModule,
    JwtModule.registerAsync(jwtOptions),
    CacheModule.registerAsync(redisOptions),
    MailModule,
    OtpModule,
    AccountModule,
    ActivityLogsModule,
    EncryptionKeyModule,
    DocumentModule,
    SupabaseModule,
    DocumentSharesModule,
    JwtUtilsModule,
  ]
})
export class AppModule { }
