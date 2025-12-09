import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { lessonIcons } from '$lib/server/db/schema';

export const GET: RequestHandler = async () => {
	const icons = await db.query.lessonIcons.findMany();

	// Convert to a map for easy lookup
	const iconMap: Record<string, string> = {};
	for (const icon of icons) {
		iconMap[icon.categoryName.toLowerCase()] = icon.iconifyId;
	}

	return json(iconMap);
};

