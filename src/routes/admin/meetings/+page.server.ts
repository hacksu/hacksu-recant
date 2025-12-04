import { db } from '$lib/server/db';
import { meetings } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import type { PageServerLoad } from './$types';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);

	const meetingsList = await db.query.meetings.findMany({
		orderBy: [desc(meetings.date)]
	});

	return {
		meetings: meetingsList
	};
};
