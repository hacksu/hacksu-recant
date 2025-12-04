import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { notes } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);

	const notesList = await db.query.notes.findMany({
		orderBy: [desc(notes.date)]
	});

	return {
		notes: notesList
	};
};
