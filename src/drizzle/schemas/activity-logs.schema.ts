import { pgTable, uuid, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user.schema";

export const activityLogs = pgTable('activity_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    action: text('action').notNull(),
    ipAddress: varchar('ip_address'),
    logDate: timestamp('log_date').defaultNow().notNull(),
    userId: uuid('user_id').notNull().references(() => users.id)
});

// types
export type ActivityLogs = typeof activityLogs.$inferSelect;