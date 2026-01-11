import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schemas';

export type DrizzleDB = NodePgDatabase<typeof schema>;

export const drizzleProvider = [
  {
    provide: 'DrizzleAsyncProvider',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const connectionUrl = configService.get<string>('database.url');
      const pool = new Pool({
        connectionString: connectionUrl,
      });

      return drizzle(pool, { schema, logger: false });
    },
  },
];
