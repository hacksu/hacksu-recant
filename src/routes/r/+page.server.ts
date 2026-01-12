import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { redirects } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const activeRedirects = await db.query.redirects.findMany({
		where: (r, { eq }) => eq(r.enabled, true),
		orderBy: [asc(redirects.slug)]
	});

	return {
		redirects: activeRedirects
	};
};
