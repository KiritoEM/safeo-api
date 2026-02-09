import {
  bigint,
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { timestamps } from './column-helper';
import { users } from './user.schema';

export const documentTypeEnum = pgEnum('file_type', [
  'pdf',
  'docs',
  'image',
  'csv',
]);
export const documentAccessLevelEnum = pgEnum('access_level', [
  'private',
  'shareable',
]);

export const documents = pgTable('document', {
  id: uuid('id').defaultRandom().primaryKey(),
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),
  fileMimeType: text('file_mimetype').notNull(),
  fileType: documentTypeEnum().default('docs').notNull(),
  encryptedMetadata: text('encrypted_metadata').notNull(),
  encryptedKey: text('encrypt_key').notNull(),
  accessLevel: documentAccessLevelEnum(),
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  ...timestamps,
});

// types
export type Document = typeof documents.$inferSelect;