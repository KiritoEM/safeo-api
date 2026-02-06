import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
import { timestamps } from './column-helper';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  fullName: text('full_name').notNull(),
  password: text('password'),
  refreshToken: text('refresh_token'),
  ...timestamps,
});

//type
export type User = typeof users.$inferSelect;
