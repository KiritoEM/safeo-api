import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { UserRepository } from './user.repository';
import { AccountModule } from 'src/account/account.module';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { JwtUtilsModule } from 'src/jwt-utils/jwt-utils.module';

@Module({
  providers: [UserService, UserRepository],
  imports: [
    DrizzleModule,
    AccountModule,
    AuthModule,
    JwtUtilsModule
  ],
  exports: [UserService, UserRepository],
  controllers: [UserController],
})
export class UserModule { }
