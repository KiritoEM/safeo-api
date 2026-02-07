import chalk from 'chalk';
import * as drizzleProvider from 'src/drizzle/drizzle.provider';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateActivityLogSchema } from './types';
import { activityLogs } from 'src/drizzle/schemas/activity-logs.schema';

@Injectable()
export class ActivityLogRepository {
  private readonly logger = new Logger(ActivityLogRepository.name);

  constructor(
    @Inject('DrizzleAsyncProvider')
    private readonly db: drizzleProvider.DrizzleDB,
  ) { }

  async log(data: CreateActivityLogSchema) {
    const createdLog = await this.db
      .insert(activityLogs)
      .values({ ...data, action: `${data.action} ${data.target}` })
      .returning();

    // log in terminal
    const formattedLog = [
      chalk.gray(`[${createdLog[0].logDate.toLocaleDateString()}]`),
      chalk.white(createdLog[0].action),
      chalk.cyan(`User: ${createdLog[0].userId}...`),
      createdLog[0].ipAddress
        ? chalk.yellow(`IP: ${createdLog[0].ipAddress}`)
        : '',
    ].join('    ');

    this.logger.log(formattedLog);
  }
}
