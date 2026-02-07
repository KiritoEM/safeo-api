import { Module } from '@nestjs/common';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { AccountRepository } from './account.repository';

@Module({
  providers: [AccountRepository],
  imports: [DrizzleModule],
  exports: [AccountRepository],
})
export class AccountModule { }
