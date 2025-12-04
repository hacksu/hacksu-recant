import { db } from '$lib/server/db';
import { meetings } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const meetingsList = await db.query.meetings.findMany({
		orderBy: [desc(meetings.date)]
	});

	return {
		meetings: meetingsList
	};
};
