import { db } from '$lib/server/db';
import { siteSettings, DEFAULT_MEETING_POSTER_KEY } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin';
import { listImages, photoFromForm } from '$lib/server/uploads';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);

	const setting = await db.query.siteSettings.findFirst({
		where: eq(siteSettings.key, DEFAULT_MEETING_POSTER_KEY)
	});

	return {
		defaultPoster: setting?.value ?? null,
		images: await listImages()
	};
};

export const actions: Actions = {
	default: async (event) => {
		await requireAdmin(event);

		const formData = await event.request.formData();

		try {
			const value = await photoFromForm(event, formData, 'meetings', 'posterPhoto');
			const now = new Date();

			await db
				.insert(siteSettings)
				.values({ key: DEFAULT_MEETING_POSTER_KEY, value, updatedAt: now })
				.onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: now } });

			throw redirect(303, '/admin/meetings');
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
				throw error;
			}
			console.error('Database error saving default poster:', error);
			return fail(500, {
				error: 'Failed to save default poster',
				details: error instanceof Error ? error.message : String(error)
			});
		}
	}
};
