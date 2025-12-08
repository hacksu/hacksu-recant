import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { lessonIcons } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);

	const body = await event.request.json();
	const { categoryName, iconifyId } = body;

	if (!categoryName || !iconifyId) {
		throw error(400, { message: 'Category name and iconify ID are required' });
	}

	// Validate iconify ID format (should be like "collection:icon")
	if (!/^[^:]+:[^:]+$/.test(iconifyId)) {
		throw error(400, { message: 'Invalid iconify ID format. Expected format: collection:icon' });
	}

	// Check if icon already exists
	const existing = await db.query.lessonIcons.findFirst({
		where: (icon, { eq }) => eq(icon.categoryName, categoryName.toLowerCase())
	});

	if (existing) {
		throw error(400, { message: 'Icon mapping for this category already exists' });
	}

	try {
		await db.insert(lessonIcons).values({
			categoryName: categoryName.toLowerCase(),
			iconifyId
		});

		return json({ success: true });
	} catch (err) {
		console.error('Error creating lesson icon:', err);
		throw error(500, { message: 'Failed to create icon mapping' });
	}
};

