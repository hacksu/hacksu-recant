import { db } from '$lib/server/db';
import { leadership } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);

	const leaders = await db.query.leadership.findMany({
		orderBy: (leadership, { desc, asc}) => [desc(leadership.isCurrent), desc(leadership.gradYear), asc(leadership.sortOrder)]
	});

	return {
		leaders
	};
};