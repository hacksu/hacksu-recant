import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

// Simple table to track admin sessions issued after Discord auth.
// The cookie will contain the `id` value; all validation happens server-side.
export const adminSessions = pgTable('admin_sessions', {
	id: text('id').primaryKey(),
	discordUserId: text('discord_user_id').notNull(),
	discordUsername: text('discord_username'), // Discord username for display
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
	sortOrder: integer('sort_order').default(9999),
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
	photo: text('photo')
});

// Redirects table
// Supports short links like /r/abc -> https://google.com
export const redirects = pgTable('redirects', {
	slug: text('slug').primaryKey(),
	targetUrl: text('target_url').notNull(),
	description: text('description'),
	enabled: boolean('enabled').notNull().default(true),
	clicks: integer('clicks').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Admin notes table
export const notes = pgTable('notes', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	date: timestamp('date', { withTimezone: true }).notNull(),
	// Main note body (markdown or plain text)
	notes: text('notes').notNull(),
	// Optional extra metadata
	tags: text('tags'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// General information blocks for /info page
export const information = pgTable('information', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	link: text('link'),
	description: text('description').notNull(),
	photo: text('photo'),
	enabled: boolean('enabled').notNull().default(true),
	sortIndex: integer('sort_index').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Lesson icon mappings for customizing category icons
export const lessonIcons = pgTable('lesson_icons', {
	categoryName: text('category_name').primaryKey(),
	iconifyId: text('iconify_id').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Admin audit log table - tracks all admin actions
export const adminAuditLog = pgTable('admin_audit_log', {
	id: text('id').primaryKey(),
	adminUserId: text('admin_user_id').notNull(), // Discord user ID
	adminUsername: text('admin_username'), // Discord username (stored for display)
	action: text('action').notNull(), // CREATE, UPDATE, DELETE
	resourceType: text('resource_type').notNull(), // information, leadership, meetings, etc.
	resourceId: text('resource_id'), // ID of the resource (can be null for some actions)
	routePath: text('route_path').notNull(), // The route where action occurred
	changesBefore: text('changes_before'), // JSON string of old values
	changesAfter: text('changes_after'), // JSON string of new values
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Email templates — saved named templates for reuse
export const emailTemplates = pgTable('email_templates', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	subject: text('subject').notNull(),
	body: text('body').notNull(),
	// [{ name: string, type: 'single' | 'list' }]
	variableNames: jsonb('variable_names').notNull().default([]),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Uploaded files — admin file manager
export const uploadedFiles = pgTable('uploaded_files', {
	id: text('id').primaryKey(),
	filename: text('filename').notNull(), // {uuid}-{sanitized-originalname} on disk
	originalName: text('original_name').notNull(),
	mimeType: text('mime_type').notNull(),
	sizeBytes: integer('size_bytes').notNull(),
	uploadedBy: text('uploaded_by').notNull(), // Discord user ID
	accessCount: integer('access_count').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	deletedAt: timestamp('deleted_at', { withTimezone: true }) // soft delete
});

// Email drafts — work-in-progress emails with full state
export const emailDrafts = pgTable('email_drafts', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	subject: text('subject').notNull().default(''),
	body: text('body').notNull().default(''),
	toAddresses: text('to_addresses').array().notNull().default([]),
	ccAddresses: text('cc_addresses').array().notNull().default([]),
	bccAddresses: text('bcc_addresses').array().notNull().default([]),
	fromName: text('from_name').notNull().default(''),
	// { [varName: string]: string | string[] }
	sharedVariables: jsonb('shared_variables').notNull().default({}),
	// { [varName: string]: string[] } — positionally aligned to toAddresses
	recipientVariables: jsonb('recipient_variables').notNull().default({}),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

