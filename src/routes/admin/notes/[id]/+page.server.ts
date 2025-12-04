import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { notes } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);
	const id = event.params.id;

	const note = await db.query.notes.findFirst({
		where: (n, { eq }) => eq(n.id, id)
	});

	if (!note) {
		throw redirect(303, '/admin/notes');
	}

	return {
		note
	};
};

export const actions: Actions = {
	default: async (event) => {
		await requireAdmin(event);
		const id = event.params.id;
		const formData = await event.request.formData();

		const title = formData.get('title')?.toString().trim();
		const dateStr = formData.get('date')?.toString().trim();
		const body = formData.get('notes')?.toString() || '';
		const tags = formData.get('tags')?.toString().trim() || null;

		if (!title || !dateStr) {
			return fail(400, { error: 'Title and date are required' });
		}

		const date = new Date(dateStr);
		if (isNaN(date.getTime())) {
			return fail(400, { error: 'Invalid date' });
		}

		if (!body.trim()) {
			return fail(400, { error: 'Notes body is required' });
		}

		try {
			await db
				.update(notes)
				.set({ title, date, notes: body, tags })
				.where(eq(notes.id, id));

			throw redirect(303, '/admin/notes');
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
				throw error;
			}
			console.error('Error updating note:', error);
			return fail(500, {
				error: 'Failed to update note',
				details: error instanceof Error ? error.message : String(error)
			});
		}
	}
};
