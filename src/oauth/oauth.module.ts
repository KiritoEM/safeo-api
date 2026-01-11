import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';
import { HttpModule } from '@nestjs/axios';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [OauthController],
  providers: [OauthService],
  imports: [HttpModule, DrizzleModule, ConfigModule, UserModule],
})
export class OauthModule {}
