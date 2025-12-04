import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { information } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const rows = await db.query.information.findMany({
		where: (info, { eq }) => eq(info.enabled, true),
		orderBy: [asc(information.sortIndex), asc(information.title)]
	});

	return {
		information: rows
	};
};
