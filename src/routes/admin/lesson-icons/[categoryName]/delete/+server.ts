import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { lessonIcons } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);

	const categoryName = event.params.categoryName;

	if (!categoryName) {
		throw error(400, { message: 'Category name is required' });
	}

	const existing = await db.query.lessonIcons.findFirst({
		where: (icon, { eq }) => eq(icon.categoryName, categoryName.toLowerCase())
	});

	if (!existing) {
		throw error(404, { message: 'Icon mapping not found' });
	}

	try {
		await db.delete(lessonIcons).where(eq(lessonIcons.categoryName, categoryName.toLowerCase()));

		throw redirect(303, '/admin/lesson-icons');
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('Error deleting lesson icon:', err);
		throw error(500, { message: 'Failed to delete icon mapping' });
	}
};

