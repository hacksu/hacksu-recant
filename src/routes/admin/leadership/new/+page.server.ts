import { db } from '$lib/server/db';
import { leadership } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, RequestEvent } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import { listImages, photoFromForm } from '$lib/server/uploads';
import { randomUUID } from 'crypto';

export const load = async (event: RequestEvent) => {
	await requireAdmin(event);
	return { images: await listImages() };
};

export const actions: Actions = {
	default: async (event) => {
		await requireAdmin(event);

		const formData = await event.request.formData();

		const name = formData.get('name')?.toString();
		const gradYearStr = formData.get('gradYear')?.toString();
		const gradTerm = formData.get('gradTerm')?.toString();
		const github = formData.get('github')?.toString() || null;
		const titlesStr = formData.get('titles')?.toString();
		const link = formData.get('link')?.toString() || null;
		const sortOrderStr = formData.get('sortOrder')?.toString();
		const isCurrent = formData.get('isCurrent') === 'on';

		// Validation
		if (!name || !gradYearStr || !gradTerm || !titlesStr || !sortOrderStr) {
			return fail(400, { error: 'Name, graduation year, term, sort order, and titles are required' });
		}

		const gradYear = parseInt(gradYearStr, 10);
		if (isNaN(gradYear) || gradYear < 1900 || gradYear > 2100) {
			return fail(400, { error: 'Invalid graduation year' });
		}

		if (gradTerm !== 'Spring' && gradTerm !== 'Fall') {
			return fail(400, { error: 'Graduation term must be either "Spring" or "Fall"' });
		}

		const titles = titlesStr
			.split(',')
			.map((t) => t.trim())
			.filter((t) => t.length > 0);

		if (titles.length === 0) {
			return fail(400, { error: 'At least one title is required' });
		}

		const sortOrder = parseInt(sortOrderStr, 10);
		if (isNaN(sortOrder)) {
			return fail(400, { error: 'Invalid sort order' });
		}

		try {
			const id = randomUUID();
			const photo = await photoFromForm(event, formData, 'leadership');

			await db.insert(leadership).values({
				id,
				name,
				gradYear,
				gradTerm,
				github,
				photo,
				titles,
				link,
				sortOrder,
				isCurrent
			});

			throw redirect(303, '/admin/leadership');
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
				throw error;
			}
			console.error('Database error creating leader:', error);
			return fail(500, {
				error: 'Failed to create leader',
				details: error instanceof Error ? error.message : String(error)
			});
		}
	}
};