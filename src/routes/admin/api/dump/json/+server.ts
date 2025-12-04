import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { adminSessions, location, leadership, meetings, redirects, notes, information } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';

export const GET: RequestHandler = async (event) => {
	await requireAdmin(event);

	// Fetch everything we care about for backup/export
	const [adminSessionsList, locationList, leadershipList, meetingsList, redirectsList, notesList, informationList] =
		await Promise.all([
			// admin sessions (you may want to omit in some contexts, but exporting for now)
			db.select().from(adminSessions),
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
			db.select().from(information)
		]);

	return json({
		generatedAt: new Date().toISOString(),
		schemaVersion: 1,
		adminSessions: adminSessionsList,
		location: locationList,
		leadership: leadershipList,
		meetings: meetingsList,
		redirects: redirectsList,
		notes: notesList,
		information: informationList
	});
};
