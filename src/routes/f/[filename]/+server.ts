import { redirect as svelteRedirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { uploadedFiles } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const { filename } = params;

	const file = await db.query.uploadedFiles.findFirst({
		where: (f, { eq, and, isNull }) => and(eq(f.filename, filename), isNull(f.deletedAt))
	});

	if (!file) {
		throw error(404, 'File not found');
	}

	// Best-effort access count increment
	try {
		await db
			.update(uploadedFiles)
			.set({ accessCount: file.accessCount + 1 })
			.where(and(eq(uploadedFiles.filename, filename), isNull(uploadedFiles.deletedAt)));
	} catch {
		// ignore
	}

	// Temporary redirect so browsers don't cache and bypass the counter
	throw svelteRedirect(307, `/uploads/uploads/${filename}`);
};
