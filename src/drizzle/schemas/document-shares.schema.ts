import { date, pgTable, uuid, boolean } from "drizzle-orm/pg-core";
import { timestamps } from "./column-helper";
import { text } from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { documents } from "./document.schema";

export const documentShares = pgTable('document_shares', {
    id: uuid('id').defaultRandom().primaryKey(),
    expiresAt: date('expires_at', { mode: 'string' }).notNull(),
    isActive: boolean('is_active').default(true),
    shareToken: text('share_token').notNull().unique(),
    ownerId: uuid('owner_id').notNull().references(() => users.id),
    documentId: uuid('document_id').notNull().references(() => documents.id),
    sharedUserId: uuid('shared_user_id').notNull().references(() => users.id),
    ...timestamps
});