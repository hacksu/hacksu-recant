import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/admin';
import { unlink } from 'fs/promises';
import { join } from 'path';

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);

	const id = event.params.id;

	const eventItem = await db.query.events.findFirst({
		where: eq(events.id, id)
	});

	if (eventItem) {
		// Delete photo file if it exists and is not a URL
		if (eventItem.photo && !eventItem.photo.startsWith('http')) {
			try {
				const photoPath = join(process.cwd(), 'static', eventItem.photo);
				await unlink(photoPath);
			} catch (error) {
				// Ignore file deletion errors (file might not exist)
				console.warn('Could not delete photo file:', error);
			}
		}

		await db.delete(events).where(eq(events.id, id));
	}

	throw redirect(303, '/admin/events');
};
