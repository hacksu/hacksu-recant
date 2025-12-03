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

// Location information table
export const location = pgTable('location', {
	id: text('id').primaryKey().default('current'),
	time: text('time').notNull(), 
	buildingRoom: text('building_room').notNull(),
	buildingSelector: text('building_selector').notNull(),
	buildingUrl: text('building_url').notNull(),
	body: text('body'), 
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

