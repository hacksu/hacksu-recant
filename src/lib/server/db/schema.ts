import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Simple table to track admin sessions issued after Discord auth.
// The cookie will contain the `id` value; all validation happens server-side.
export const adminSessions = pgTable('admin_sessions', {
	id: text('id').primaryKey(),
	discordUserId: text('discord_user_id').notNull(),
	isAdmin: boolean('is_admin').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
});

