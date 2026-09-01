import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { checklistItems } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { normalizeChecklistBody, normalizeChecklistItem } from '$lib/server/checklist';
import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);

	return {
		items: await db.query.checklistItems.findMany({
			orderBy: [desc(checklistItems.createdAt)]
		})
	};
};

export const actions: Actions = {
	create: async (event) => {
		await requireAdmin(event);

		const formData = await event.request.formData();
		const item = normalizeChecklistItem(formData.get('item'));
		if (!item) return fail(400, { error: 'Item is required' });

		await db.insert(checklistItems).values({
			id: randomUUID(),
			item,
			body: normalizeChecklistBody(formData.get('body'))
		});
	},

	toggle: async (event) => {
		await requireAdmin(event);

		const formData = await event.request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { error: 'Item id is required' });

		const checked = (formData.get('toggle') ?? formData.get('checked')) === 'true';
		await db
			.update(checklistItems)
			.set({ checkedAt: checked ? new Date() : null })
			.where(eq(checklistItems.id, id));
	},

	updateBody: async (event) => {
		await requireAdmin(event);

		const formData = await event.request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { error: 'Item id is required' });

		await db
			.update(checklistItems)
			.set({ body: normalizeChecklistBody(formData.get('body')) })
			.where(eq(checklistItems.id, id));
	}
};
