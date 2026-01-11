import { relations } from 'drizzle-orm';
import { users } from './user.schema';
import { account } from './account.schema';

export const usersRelations = relations(users, ({ one }) => ({
  account: one(account, {
    fields: [users.id],
    references: [account.userId],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(users, {
    fields: [account.userId],
    references: [users.id],
  }),
}));
