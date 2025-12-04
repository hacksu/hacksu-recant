import { db } from '$lib/server/db';
import { leadership } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/admin';
import { unlink } from 'fs/promises';
import { join } from 'path';

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);

	const id = event.params.id;

	const leader = await db.query.leadership.findFirst({
		where: eq(leadership.id, id)
	});

	if (leader) {
		// Delete photo file if it exists and is not a GitHub URL
		if (leader.photo && !leader.photo.startsWith('http')) {
			try {
				const photoPath = join(process.cwd(), 'static', leader.photo);
				await unlink(photoPath);
			} catch (error) {
				// Ignore file deletion errors (file might not exist)
				console.warn('Could not delete photo file:', error);
			}
		}

		await db.delete(leadership).where(eq(leadership.id, id));
	}

	throw redirect(303, '/admin/leadership');
};