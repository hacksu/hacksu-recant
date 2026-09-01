import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	adminSessions,
	checklistItems,
	location,
	leadership,
	meetings,
	redirects,
	notes,
	information,
	lessonIcons,
	emailTemplates,
	emailDrafts,
	uploadedFiles
} from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';

export const GET: RequestHandler = async (event) => {
	await requireAdmin(event);

	// Fetch everything we care about for backup/export
	const [
		adminSessionsList,
		checklistItemsList,
		locationList,
		leadershipList,
		meetingsList,
		redirectsList,
		notesList,
		informationList,
		lessonIconsList,
		emailTemplatesList,
		emailDraftsList,
		uploadedFilesList
	] = await Promise.all([
		// admin sessions (you may want to omit in some contexts, but exporting for now)
		db.select().from(adminSessions),
		db.select().from(checklistItems),
		// there is usually only one location row
		db.select().from(location),
		// leadership and terms
		db.select().from(leadership),
		// meetings
		db.select().from(meetings),
		// redirects
		db.select().from(redirects),
		// admin notes
		db.select().from(notes),
		// helpful information blocks
		db.select().from(information),
		// lesson icon mappings
		db.select().from(lessonIcons),
		// email templates
		db.select().from(emailTemplates),
		// email drafts
		db.select().from(emailDrafts),
		// uploaded files (metadata only; binaries are handled by /admin/api/dump/assets)
		db.select().from(uploadedFiles)
	]);

	return json({
		generatedAt: new Date().toISOString(),
		schemaVersion: 2,
		adminSessions: adminSessionsList,
		location: locationList,
		leadership: leadershipList,
		meetings: meetingsList,
		redirects: redirectsList,
		checklistItems: checklistItemsList,
		notes: notesList,
		information: informationList,
		lessonIcons: lessonIconsList,
		emailTemplates: emailTemplatesList,
		emailDrafts: emailDraftsList,
		uploadedFiles: uploadedFilesList
	});
};

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);

	const body = await event.request.json();

	// Destructure expected collections with safe defaults
	const {
		adminSessions: adminSessionsList = [],
		location: locationList = [],
		leadership: leadershipList = [],
		meetings: meetingsList = [],
		redirects: redirectsList = [],
		checklistItems: checklistItemsList = [],
		notes: notesList = [],
		information: informationList = [],
		lessonIcons: lessonIconsList = [],
		emailTemplates: emailTemplatesList = [],
		emailDrafts: emailDraftsList = [],
		uploadedFiles: uploadedFilesList = []
	} = body ?? {};

	// Naive restore strategy:
	//  - wipe existing rows
	//  - insert exactly what is in the dump
	// Use with caution; this is intended for full-environment restore.
	// I may want to add extra safety checks in the future.

	// Delete in an order that avoids FK issues (none currently defined, but be conservative)
	await db.delete(adminSessions);
	await db.delete(location);
	await db.delete(leadership);
	await db.delete(meetings);
	await db.delete(redirects);
	await db.delete(checklistItems);
	await db.delete(notes);
	await db.delete(information);
	await db.delete(lessonIcons);
	await db.delete(emailTemplates);
	await db.delete(emailDrafts);
	await db.delete(uploadedFiles);

	// Helper to parse ISO timestamp fields into Date instances
	const parseDate = (value: unknown): Date | null => {
		if (typeof value === 'string') {
			const d = new Date(value);
			return isNaN(d.getTime()) ? null : d;
		}
		if (value instanceof Date) return value;
		return null;
	};

	// Re-insert if there is data. Convert any timestamp fields back to Date objects.
	if (Array.isArray(adminSessionsList) && adminSessionsList.length > 0) {
		const rows = adminSessionsList.map((row: any) => ({
			...row,
			createdAt: parseDate(row.createdAt),
			expiresAt: parseDate(row.expiresAt)
		}));
		await db.insert(adminSessions).values(rows);
	}
	if (Array.isArray(locationList) && locationList.length > 0) {
		const rows = locationList.map((row: any) => ({
			...row,
			createdAt: parseDate(row.createdAt),
			updatedAt: parseDate(row.updatedAt)
		}));
		await db.insert(location).values(rows);
	}
	if (Array.isArray(leadershipList) && leadershipList.length > 0) {
		// leadership has only scalar fields, no timestamps
		await db.insert(leadership).values(leadershipList as any);
	}
	if (Array.isArray(meetingsList) && meetingsList.length > 0) {
		const rows = meetingsList.map((row: any) => ({
			...row,
			date: parseDate(row.date)
		}));
		await db.insert(meetings).values(rows);
	}
	if (Array.isArray(redirectsList) && redirectsList.length > 0) {
		const rows = redirectsList.map((row: any) => ({
			...row,
			createdAt: parseDate(row.createdAt),
			updatedAt: parseDate(row.updatedAt)
		}));
		await db.insert(redirects).values(rows);
	}
	if (Array.isArray(notesList) && notesList.length > 0) {
		const rows = notesList.map((row: any) => {
			// Use createdAt as fallback if date is null (for legacy data)
			const date = parseDate(row.date) || parseDate(row.createdAt) || new Date();
			return {
				...row,
				date,
				createdAt: parseDate(row.createdAt),
				updatedAt: parseDate(row.updatedAt)
			};
		});
		await db.insert(notes).values(rows);
	}
	if (Array.isArray(checklistItemsList) && checklistItemsList.length > 0) {
		const rows = checklistItemsList.map(
			(row: {
				id: string;
				item: string;
				body?: string | null;
				createdAt: string | Date | null;
				checkedAt?: string | Date | null;
			}) => ({
				...row,
				createdAt: parseDate(row.createdAt) ?? new Date(),
				checkedAt: parseDate(row.checkedAt)
			})
		);
		await db.insert(checklistItems).values(rows);
	}
	if (Array.isArray(informationList) && informationList.length > 0) {
		const rows = informationList.map((row: any) => ({
			...row,
			createdAt: parseDate(row.createdAt),
			updatedAt: parseDate(row.updatedAt)
		}));
		await db.insert(information).values(rows);
	}
	if (Array.isArray(lessonIconsList) && lessonIconsList.length > 0) {
		const rows = lessonIconsList.map((row: any) => ({
			...row,
			createdAt: parseDate(row.createdAt),
			updatedAt: parseDate(row.updatedAt)
		}));
		await db.insert(lessonIcons).values(rows);
	}
	if (Array.isArray(emailTemplatesList) && emailTemplatesList.length > 0) {
		const rows = emailTemplatesList.map((row: any) => ({
			...row,
			createdAt: parseDate(row.createdAt),
			updatedAt: parseDate(row.updatedAt)
		}));
		await db.insert(emailTemplates).values(rows);
	}
	if (Array.isArray(emailDraftsList) && emailDraftsList.length > 0) {
		const rows = emailDraftsList.map((row: any) => ({
			...row,
			createdAt: parseDate(row.createdAt),
			updatedAt: parseDate(row.updatedAt)
		}));
		await db.insert(emailDrafts).values(rows);
	}
	if (Array.isArray(uploadedFilesList) && uploadedFilesList.length > 0) {
		const rows = uploadedFilesList.map((row: any) => ({
			...row,
			createdAt: parseDate(row.createdAt),
			deletedAt: parseDate(row.deletedAt)
		}));
		await db.insert(uploadedFiles).values(rows);
	}

	return json({
		ok: true,
		restoredAt: new Date().toISOString(),
		counts: {
			adminSessions: adminSessionsList.length ?? 0,
			location: locationList.length ?? 0,
			leadership: leadershipList.length ?? 0,
			meetings: meetingsList.length ?? 0,
			redirects: redirectsList.length ?? 0,
			checklistItems: checklistItemsList.length ?? 0,
			notes: notesList.length ?? 0,
			information: informationList.length ?? 0,
			lessonIcons: lessonIconsList.length ?? 0,
			emailTemplates: emailTemplatesList.length ?? 0,
			emailDrafts: emailDraftsList.length ?? 0,
			uploadedFiles: uploadedFilesList.length ?? 0
		}
	});
};
