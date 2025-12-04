import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

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

// Leadership table
export const leadership = pgTable('leadership', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	gradYear: integer('grad_year').notNull(),
	gradTerm: text('grad_term').notNull(), 
	github: text('github'), 
	photo: text('photo'), 
	titles: text('titles').array().notNull(),
	link: text('link'), 
	isCurrent: boolean('is_current').notNull().default(false)
});

// Meetings table
export const meetings = pgTable('meetings', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	date: timestamp('date', { withTimezone: true }).notNull(),
	presenter: text('presenter'),
	link: text('link'),
	descriptionMD: text('description_md'),
	descriptionHTML: text('description_html'),
	photo: text('photo')
});

// Redirects table
// Supports short links like /redir/abc -> https://google.com
export const redirects = pgTable('redirects', {
	// Short code used in the URL, e.g. "abc" for /redir/abc
	slug: text('slug').primaryKey(),
	// Absolute target URL to redirect to
	targetUrl: text('target_url').notNull(),
	// Optional human-readable description
	description: text('description'),
	// Whether this redirect is currently active
	enabled: boolean('enabled').notNull().default(true),
	// Optional count of how many times this redirect was used
	clicks: integer('clicks').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

