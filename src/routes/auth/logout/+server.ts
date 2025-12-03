import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { adminSessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

async function handleLogout(event: Parameters<RequestHandler>[0]) {
	const sessionId = event.cookies.get('admin_session');
	if (sessionId) {
		await db.delete(adminSessions).where(eq(adminSessions.id, sessionId));
	}

	event.cookies.delete('admin_session', { path: '/' });

	throw redirect(302, '/');
}

export const GET: RequestHandler = async (event) => {
	return handleLogout(event);
};

export const POST: RequestHandler = async (event) => {
	return handleLogout(event);
};

