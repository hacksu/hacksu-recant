import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { redirects } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);
	const slug = event.params.slug;

	await db.delete(redirects).where(eq(redirects.slug, slug));

	throw redirect(303, '/admin/redirects');
};
