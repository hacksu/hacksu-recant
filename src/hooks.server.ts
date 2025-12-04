import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('admin_session');

	if (sessionId) {
		const now = new Date();

		try {
			const session = await db.query.adminSessions.findFirst({
				where: (session, { eq, and, gt }) =>
					and(eq(session.id, sessionId), eq(session.isAdmin, true), gt(session.expiresAt, now))
			});

			event.locals.isAdmin = Boolean(session);
		} catch (error) {
			event.locals.isAdmin = false;
		}
	} else {
		event.locals.isAdmin = false;
	}

	return resolve(event);
};
