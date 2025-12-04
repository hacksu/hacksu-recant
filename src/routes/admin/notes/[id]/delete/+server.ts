import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { notes } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);
	const id = event.params.id;

	await db.delete(notes).where(eq(notes.id, id));

	throw redirect(303, '/admin/notes');
};
