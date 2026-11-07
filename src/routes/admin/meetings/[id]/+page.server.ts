import { db } from '$lib/server/db';
import { meetings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin';
import { listImages, photoFromForm } from '$lib/server/uploads';
import { zonedDateTimeLocalToUtc } from '$lib/utils/timezone';

export const load: PageServerLoad = async (event) => {
	const id = event.params.id;
	await requireAdmin(event);

	const eventItem = await db.query.meetings.findFirst({
		where: eq(meetings.id, id)
	});

	if (!eventItem) {
		throw redirect(303, '/admin/meetings');
	}

	return {
		event: eventItem,
		images: await listImages()
	};
};

export const actions: Actions = {
	default: async (event) => {
		const id = event.params.id;
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
			const existing = await db.query.meetings.findFirst({
				where: eq(meetings.id, id)
			});

			if (!existing) {
				return fail(404, { error: 'Event not found' });
			}

			const photo = await photoFromForm(event, formData, 'meetings');
			await db
				.update(meetings)
				.set({ title, date, presenter, link, descriptionMD, photo })
				.where(eq(meetings.id, id));

			throw redirect(303, '/admin/meetings');
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
				throw error;
			}
			console.error('Database error updating event:', error);
			return fail(500, {
				error: 'Failed to update event',
				details: error instanceof Error ? error.message : String(error)
			});
		}
	}
};
