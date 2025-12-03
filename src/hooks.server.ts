import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { adminSessions } from '$lib/server/db/schema';
import { and, eq, gt } from 'drizzle-orm';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('admin_session');

	if (sessionId) {
		const now = new Date();

		const session = await db.query.adminSessions.findFirst({
			where: (session, { eq, and, gt }) =>
				and(eq(session.id, sessionId), eq(session.isAdmin, true), gt(session.expiresAt, now))
		});

		event.locals.isAdmin = Boolean(session);
	} else {
		event.locals.isAdmin = false;
	}

	return resolve(event);
};
