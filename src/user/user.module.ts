import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { UserRepository } from './user.repository';
import { AccountModule } from 'src/account/account.module';

@Module({
  providers: [UserService, UserRepository],
  imports: [DrizzleModule, AccountModule],
  exports: [UserService, UserRepository],
})
export class UserModule {}
