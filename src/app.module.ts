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
import { AppService } from './app.service';
import { OauthModule } from './oauth/oauth.module';
import jwtConfig, { jwtOptions } from './core/configs/jwt.config';
import { OtpModule } from './otp/otp.module';
import { AccountModule } from './account/account.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { EncryptionService } from './encryption/encryption.service';
import { EncryptionModule } from './encryption/encryption.module';
import mailConfig from './core/configs/mail.config';
import encryptionConfig from './core/configs/encryption.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [oauthConfig, dbConfig, redisConfig, mailConfig, jwtConfig, encryptionConfig],
    }),
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
    EncryptionModule,
  ],
  providers: [AppService, EncryptionService],
})
export class AppModule { }
