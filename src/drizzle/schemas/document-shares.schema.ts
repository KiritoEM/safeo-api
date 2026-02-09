import { pgTable, uuid, boolean, text } from 'drizzle-orm/pg-core';
import { timestamps } from './column-helper';
import { users } from './user.schema';
import { documents } from './document.schema';
import { timestamp } from 'drizzle-orm/pg-core';

export const documentShares = pgTable('document_shares', {
  id: uuid('id').defaultRandom().primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
  isExpired: boolean('is_expired').default(true),
  shareToken: text('share_token').notNull().unique(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id),
  documentId: uuid('document_id')
    .notNull()
    .references(() => documents.id),
  sharedUserId: uuid('shared_user_id')
    .notNull()
    .references(() => users.id),
  ...timestamps,
});
