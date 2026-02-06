import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { UpdateAccountSchema } from 'src/user/types';
import * as drizzleProvider from 'src/drizzle/drizzle.provider';
import { Account, account } from 'src/drizzle/schemas';

@Injectable()
export class AccountRepository {
  constructor(
    @Inject('DrizzleAsyncProvider') private db: drizzleProvider.DrizzleDB,
  ) {}

  async updateAccount(
    userId: string,
    accountData: UpdateAccountSchema,
  ): Promise<Account[]> {
    return await this.db
      .update(account)
      .set({ ...accountData })
      .where(eq(account.userId, userId))
      .returning();
  }
}
