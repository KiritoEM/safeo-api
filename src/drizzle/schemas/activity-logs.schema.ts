import { pgTable, uuid, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./column-helper";
import { users } from "./user.schema";

export const activityLogs = pgTable('activity_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    action: text('action').notNull(),
    ipAddress: varchar('ip_address'),
    userId: uuid('user_id').notNull().references(() => users.id),
    ...timestamps
});

// types
export type ActivityLogs = typeof activityLogs.$inferSelect;