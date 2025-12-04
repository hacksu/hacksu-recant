import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { information } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { asc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);

	const items = await db.query.information.findMany({
		orderBy: [asc(information.sortIndex), asc(information.title)]
	});

	return {
		information: items
	};
};
