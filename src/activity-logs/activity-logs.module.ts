import { Module } from '@nestjs/common';
import { ActivityLogRepository } from './activity-logs.repository';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  providers: [ActivityLogRepository],
  exports: [ActivityLogRepository],
  imports: [DrizzleModule],
})
export class ActivityLogsModule {}
