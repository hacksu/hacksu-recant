import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { lessonIcons } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { asc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);

	const icons = await db.query.lessonIcons.findMany({
		orderBy: [asc(lessonIcons.categoryName)]
	});

	return {
		icons
	};
};

