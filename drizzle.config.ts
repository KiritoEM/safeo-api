import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './src/drizzle/schemas/**/*.ts',
  out: './src/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public'
  }
} satisfies Config;
