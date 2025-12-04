import { db } from '$lib/server/db';
import { redirects } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin';
import { asc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);

	const redirectsList = await db.query.redirects.findMany({
		orderBy: [asc(redirects.slug)]
	});

	return {
		redirects: redirectsList
	};
};
