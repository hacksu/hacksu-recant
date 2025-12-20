import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { db } from '$lib/server/db';
import { captureBeforeState, autoLogAdminAction } from '$lib/server/audit-auto';

// First handle: Set admin status and capture before state
const setAdminStatus: Handle = async ({ event, resolve }) => {
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

	// Capture before state for admin actions (before the handler runs)
	await captureBeforeState(event);

	return resolve(event);
};

// Second handle: Auto-log admin actions after handler executes
const auditLogHandle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	
	// Log admin actions after the handler has executed
	// We do this asynchronously so it doesn't block the response
	autoLogAdminAction(event).catch((error) => {
		console.error('Failed to log admin action:', error);
	});

	return response;
};

export const handle = sequence(setAdminStatus, auditLogHandle);
