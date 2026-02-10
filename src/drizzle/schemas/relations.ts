import { relations } from 'drizzle-orm';
import { users } from './user.schema';
import { account } from './account.schema';
import { documents } from './document.schema';
import { activityLogs } from './activity-logs.schema';
import { documentShares } from './document-shares.schema';

export const usersRelations = relations(users, ({ one, many }) => ({
  account: one(account, {
    fields: [users.id],
    references: [account.userId],
  }),
  documents: many(documents),
  activityLogs: many(activityLogs),
  ownedShares: many(documentShares, {
    relationName: 'owner',
  }),
  receivedShares: many(documentShares, {
    relationName: 'sharedWith',
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(users, {
    fields: [account.userId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  shares: many(documentShares),
}));

export const documentsSharesRelations = relations(
  documentShares,
  ({ one }) => ({
    owner: one(users, {
      fields: [documentShares.ownerId],
      references: [users.id],
      relationName: 'owner',
    }),
    sharedWith: one(users, {
      fields: [documentShares.sharedUserId],
      references: [users.id],
      relationName: 'sharedWith',
    }),
    document: one(documents, {
      fields: [documentShares.documentId],
      references: [documents.id],
    }),
  }),
);

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));
