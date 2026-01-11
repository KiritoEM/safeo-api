import { Injectable, NotFoundException } from '@nestjs/common';
import { Account, User } from 'src/drizzle/schemas';
import { UserRepository } from './user.repository';
import {
  CreateUserSchema,
  CreateUserWithAccountSchema,
  UpdateAccountSchema,
} from './types';
import { AccountRepository } from 'src/account/account.repository';
import { AuthTypeEnum } from 'src/core/enums/auth_enums';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private accountRespository: AccountRepository,
  ) {}

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findUserById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findUserByEmail(email);
  }

  async createNewUser(
    userData: CreateUserSchema | CreateUserWithAccountSchema,
    authType: AuthTypeEnum,
  ): Promise<User[]> {
    if (authType === AuthTypeEnum.CREDENTIAL) {
      return await this.userRepository.createUser(userData as CreateUserSchema);
    } else {
      return await this.userRepository.createUserWithAccount(
        userData as CreateUserWithAccountSchema,
      );
    }
  }

  async updateAccount(
    userId: string,
    accountData: UpdateAccountSchema,
  ): Promise<Account[]> {
    const user = await this.userRepository.findUserById(userId);

    if (!user)
      throw new NotFoundException('Aucun utilisateur trouvé avec cet ID.');

    return await this.accountRespository.updateAccound(userId, accountData);
  }
}
