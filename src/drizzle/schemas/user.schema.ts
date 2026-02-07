import { pgTable, uuid, text, bigint, boolean, timestamp } from 'drizzle-orm/pg-core';
import { timestamps } from './column-helper';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  fullName: text('full_name').notNull(),
  password: text('password'),
  encryptionKey: text('encryption_key').notNull(),
  encryptionIv: text('encryption_iv').notNull(),
  storageLimits: bigint('storage_limits', { mode: 'number' }).notNull(),
  storageUsed: bigint('storage_used', { mode: 'number' }).default(0),
  isActive: boolean('is_active').default(true),
  refreshToken: text('refresh_token'),
  lastLoginAt: timestamp('last_login_at').defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: timestamp('deleted_at').defaultNow(),
  ...timestamps,
});

// types
export type User = typeof users.$inferSelect;
