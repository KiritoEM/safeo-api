/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Account, User } from 'src/drizzle/schemas';
import { UserRepository } from './user.repository';
import {
  CreateUserSchema,
  CreateUserWithAccountSchema,
  UpdateAccountSchema,
  UserPublic,
} from './types';
import { AccountRepository } from 'src/account/account.repository';
import { AuthTypeEnum } from 'src/core/enums/auth-enums';
import { ActivityLogRepository } from 'src/activity-logs/activity-logs.repository';
import { AUDIT_ACTIONS, AUDIT_TARGET } from 'src/activity-logs/constants';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private accountRespository: AccountRepository,
    private logRepository: ActivityLogRepository,
  ) {}

  async getUserById(
    userId: string,
    ipAddress?: string,
  ): Promise<UserPublic | null> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const { encryptedKey, refreshToken, ...userPublic } = user;

    // audit log
    await this.logRepository.log({
      action: AUDIT_ACTIONS.GET_USER_INFO,
      target: AUDIT_TARGET.USER,
      userId,
      ipAddress,
    });

    return userPublic ?? null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findUserByEmail(email);
  }

  async createNewUser(
    userData: CreateUserSchema | CreateUserWithAccountSchema,
    authType: AuthTypeEnum,
  ): Promise<User | null> {
    if (authType === AuthTypeEnum.CREDENTIAL) {
      const user = await this.userRepository.create(
        userData as CreateUserSchema,
      );

      return user[0];
    } else {
      const account = await this.userRepository.createUserWithAccount(
        userData as CreateUserWithAccountSchema,
      );

      return account[0];
    }
  }

  async updateAccount(
    userId: string,
    accountData: UpdateAccountSchema,
  ): Promise<Account | null> {
    const user = await this.userRepository.findUserById(userId);

    if (!user)
      throw new NotFoundException('Aucun utilisateur trouvé avec cet ID.');

    const account = await this.accountRespository.updateAccount(
      userId,
      accountData,
    );

    return account[0];
  }
}
