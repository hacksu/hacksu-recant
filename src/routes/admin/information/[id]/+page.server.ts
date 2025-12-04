import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { information } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);
	const id = event.params.id;

	const item = await db.query.information.findFirst({
		where: (info, { eq }) => eq(info.id, id)
	});

	if (!item) {
		throw redirect(303, '/admin/information');
	}

	return {
		information: item
	};
};

export const actions: Actions = {
	default: async (event) => {
		await requireAdmin(event);
		const id = event.params.id;
		const formData = await event.request.formData();

		const title = formData.get('title')?.toString().trim();
		const link = formData.get('link')?.toString().trim() || null;
		const description = formData.get('description')?.toString() || '';
		const photo = formData.get('photo')?.toString().trim() || null;
		const enabledStr = formData.get('enabled')?.toString();
		const enabled = enabledStr === 'on' || enabledStr === 'true' || enabledStr === '1';
		const sortIndexStr = formData.get('sortIndex')?.toString().trim();
		const sortIndex = sortIndexStr ? Number(sortIndexStr) : 0;

		if (!title || !description.trim()) {
			return fail(400, { error: 'Title and description are required' });
		}

		if (Number.isNaN(sortIndex)) {
			return fail(400, { error: 'Sort index must be a valid number' });
		}

		try {
			await db
				.update(information)
				.set({ title, link, description, photo, enabled, sortIndex })
				.where(eq(information.id, id));

			throw redirect(303, '/admin/information');
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
				throw error;
			}
			console.error('Error updating information block:', error);
			return fail(500, {
				error: 'Failed to update information block',
				details: error instanceof Error ? error.message : String(error)
			});
		}
	}
};
