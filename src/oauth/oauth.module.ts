import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';
import { HttpModule } from '@nestjs/axios';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { EncryptionKeyModule } from 'src/encryption/encryption-key.module';
import { JwtUtilsService } from 'src/jwt/jwt-utils.service';

@Module({
  controllers: [OauthController],
  providers: [OauthService, JwtUtilsService],
  imports: [
    HttpModule,
    DrizzleModule,
    ConfigModule,
    UserModule,
    EncryptionKeyModule
  ],
})
export class OauthModule { }
