import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { lessonIcons } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { eq } from 'drizzle-orm';


export const PUT: RequestHandler = async (event) => {
	await requireAdmin(event);

	const categoryName = event.params.categoryName;
	const body = await event.request.json();
	const { iconifyId } = body;

	if (!categoryName || !iconifyId) {
		throw error(400, { message: 'Category name and iconify ID are required' });
	}

	// Validate iconify ID format
	if (!/^[^:]+:[^:]+$/.test(iconifyId)) {
		throw error(400, { message: 'Invalid iconify ID format. Expected format: collection:icon' });
	}

	const existing = await db.query.lessonIcons.findFirst({
		where: (icon, { eq }) => eq(icon.categoryName, categoryName.toLowerCase())
	});

	if (!existing) {
		throw error(404, { message: 'Icon mapping not found' });
	}

	try {
		await db
			.update(lessonIcons)
			.set({ iconifyId, updatedAt: new Date() })
			.where(eq(lessonIcons.categoryName, categoryName.toLowerCase()));

		return json({ success: true });
	} catch (err) {
		console.error('Error updating lesson icon:', err);
		throw error(500, { message: 'Failed to update icon mapping' });
	}
};

