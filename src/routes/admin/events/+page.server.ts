import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import type { PageServerLoad } from './$types';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);

	const eventsList = await db.query.events.findMany({
		orderBy: [desc(events.date)]
	});

	return {
		events: eventsList
	};
};
