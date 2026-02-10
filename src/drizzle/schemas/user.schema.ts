import {
  pgTable,
  uuid,
  text,
  bigint,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { timestamps } from './column-helper';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  fullName: text('full_name').notNull(),
  password: text('password'),
  encryptedKey: text('encrypted_key'),
  storageLimits: bigint('storage_limits', { mode: 'number' }).default(
    0.5 * 1024 * 1024 * 1024,
  ),
  storageUsed: bigint('storage_used', { mode: 'number' }).default(0),
  isActive: boolean('is_active').default(true),
  refreshToken: text('refresh_token'),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: timestamp('deleted_at', {
    withTimezone: true,
    mode: 'date',
  }).defaultNow(),
  ...timestamps,
});

// types
export type User = typeof users.$inferSelect;
