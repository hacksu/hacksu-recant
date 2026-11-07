import { db } from '$lib/server/db';
import { meetings } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin';
import { listImages, photoFromForm } from '$lib/server/uploads';
import { randomUUID } from 'crypto';
import { zonedDateTimeLocalToUtc } from '$lib/utils/timezone';


export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);
	return { images: await listImages() };
};

export const actions: Actions = {
	default: async (event) => {
		await requireAdmin(event);

		const formData = await event.request.formData();

		const title = formData.get('title')?.toString();
		const dateStr = formData.get('date')?.toString();
		const presenter = formData.get('presenter')?.toString() || null;
		const link = formData.get('link')?.toString() || null;
		const descriptionMD = formData.get('descriptionMD')?.toString() || null;

		// Validation
		if (!title || !dateStr) {
			return fail(400, { error: 'Title and date are required' });
		}

		const date = zonedDateTimeLocalToUtc(dateStr);
		if (isNaN(date.getTime())) {
			return fail(400, { error: 'Invalid date' });
		}

		try {
			const id = randomUUID();
			const photo = await photoFromForm(event, formData, 'meetings');

			await db.insert(meetings).values({
				id,
				title,
				date,
				presenter,
				link,
				descriptionMD,
				photo
			});

			throw redirect(303, '/admin/meetings');
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
				throw error;
			}
			console.error('Database error creating event:', error);
			return fail(500, {
				error: 'Failed to create event',
				details: error instanceof Error ? error.message : String(error)
			});
		}
	}
};
