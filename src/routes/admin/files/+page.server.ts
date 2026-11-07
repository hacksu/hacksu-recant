import { unlink } from 'fs/promises';
import { join } from 'path';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { uploadedFiles } from '$lib/server/db/schema';
import { requireAdmin, getAdminUser } from '$lib/server/admin';
import { desc, eq, and, isNull } from 'drizzle-orm';
import { registerLegacyUploads, saveUpload, uploadsRoot } from '$lib/server/uploads';
import { isUploadCategory, uploadDir } from '$lib/uploads';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);

	await registerLegacyUploads();
	const files = await db.query.uploadedFiles.findMany({
		where: (f, { isNull }) => isNull(f.deletedAt),
		orderBy: [desc(uploadedFiles.createdAt)]
	});

	return { files };
};

export const actions: Actions = {
	upload: async (event) => {
		await requireAdmin(event);

		const uploadedBy = await getAdminUser(event);
		if (!uploadedBy) return fail(403, { error: 'Not authorized' });

		const formData = await event.request.formData();
		const file = formData.get('file') as File | null;
		const category = formData.get('category');

		if (!file || file.size === 0) {
			return fail(400, { error: 'No file provided' });
		}
		if (!isUploadCategory(category)) {
			return fail(400, { error: 'Invalid category' });
		}

		try {
			await saveUpload(file, category, uploadedBy);
		} catch {
			return fail(500, { error: 'Failed to save file' });
		}

		throw redirect(303, '/admin/files');
	},

	delete: async (event) => {
		await requireAdmin(event);

		const formData = await event.request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing id' });

		const file = await db.query.uploadedFiles.findFirst({
			where: (f, { eq, and, isNull }) => and(eq(f.id, id), isNull(f.deletedAt))
		});

		if (!file) return fail(404, { error: 'File not found' });

		await db
			.update(uploadedFiles)
			.set({ deletedAt: new Date() })
			.where(and(eq(uploadedFiles.id, id), isNull(uploadedFiles.deletedAt)));

		try {
			await unlink(join(uploadsRoot, uploadDir(file.category), file.filename));
		} catch {}

		throw redirect(303, '/admin/files');
	}
};
