import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as drizzleProvider from 'src/drizzle/drizzle.provider';
import { Account, account, User, users } from 'src/drizzle/schemas';
import {
  CreateUserSchema,
  CreateUserWithAccountSchema,
  update,
} from './types';
import { UserStorageStatusEnum } from './enums';

export type UserWithAccount = User & {
  account: Account | null;
};

@Injectable()
export class UserRepository {
  constructor(
    @Inject('DrizzleAsyncProvider')
    private readonly db: drizzleProvider.DrizzleDB,
  ) { }

  async findUserById(id: string): Promise<User | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    return user ?? null;
  }

  async checkStorageStatus(id: string, fileToUploadSize: number): Promise<UserStorageStatusEnum> {
    const user = await this.findUserById(id);

    if (!user) return UserStorageStatusEnum.UNAVAILABLE;

    if (user.storageLimits! == user.storageUsed!) return UserStorageStatusEnum.FULL;

    if (user.storageLimits! <= fileToUploadSize + user.storageUsed!) return UserStorageStatusEnum.INSUFFICIENT;

    return UserStorageStatusEnum.AVAILABLE;
  }

  async findUserByEmail(email: string): Promise<UserWithAccount | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
      with: { account: true },
    });

    return user ?? null;
  }

  async findUserByRefreshToken(
    refreshToken: string,
  ): Promise<UserWithAccount | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.refreshToken, refreshToken),
      with: { account: true },
    });

    return user ?? null;
  }

  async create(data: CreateUserSchema): Promise<User[]> {
    return await this.db.insert(users).values(data).returning();
  }

  async createUserWithAccount(
    data: CreateUserWithAccountSchema,
  ): Promise<User[]> {
    return await this.db.transaction(async (tx) => {
      const user = await tx.insert(users).values(data).returning();

      await tx
        .insert(account)
        .values({
          userId: user[0].id,
          type: data.type,
          provider: data.provider,
          accessToken: data.accessToken,
          tokenType: 'Bearer',
          expiresAt: data.expiresAt,
          scope: data.scope,
          idToken: data.idToken,
          sessionState: data.sessionState,
          providerAccountId: data.providerAccountId,
        })
        .returning();

      return user;
    });
  }

  async update(id: string, data: update): Promise<User[]> {
    return await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
  }
}
