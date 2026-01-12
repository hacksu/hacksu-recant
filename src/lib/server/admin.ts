import { redirect } from '@sveltejs/kit';

import type { RequestEvent } from '@sveltejs/kit';

import { db } from '$lib/server/db';

import { adminSessions } from '$lib/server/db/schema';



// Require that the user has a valid admin_session cookie backed by the database.

// The cookie value is a random session ID that must exist in the admin_sessions

// table and not be expired.

export async function requireAdmin(event: RequestEvent) {

	const sessionId = event.cookies.get('admin_session');



	if (!sessionId) {

		throw redirect(302, '/auth/discord');

	}



	const now = new Date();



	const session = await db.query.adminSessions.findFirst({

		where: (session, { eq, and, gt }) =>

			and(eq(session.id, sessionId), eq(session.isAdmin, true), gt(session.expiresAt, now))

	});



	if (!session) {

		throw redirect(302, '/auth/discord');

	}

}

// Get admin user info from session (for audit logging)
// Returns the Discord user ID if authenticated, null otherwise
export async function getAdminUser(event: RequestEvent): Promise<string | null> {
	const sessionId = event.cookies.get('admin_session');

	if (!sessionId) {
		return null;
	}

	const now = new Date();

	const session = await db.query.adminSessions.findFirst({
		where: (session, { eq, and, gt }) =>
			and(eq(session.id, sessionId), eq(session.isAdmin, true), gt(session.expiresAt, now))
	});

	return session?.discordUserId || null;
}

// Get admin user info including username from session (for audit logging)
export async function getAdminUserInfo(event: RequestEvent): Promise<{ userId: string; username: string | null } | null> {
	const sessionId = event.cookies.get('admin_session');

	if (!sessionId) {
		return null;
	}

	const now = new Date();

	const session = await db.query.adminSessions.findFirst({
		where: (session, { eq, and, gt }) =>
			and(eq(session.id, sessionId), eq(session.isAdmin, true), gt(session.expiresAt, now))
	});

	if (!session) {
		return null;
	}

	return {
		userId: session.discordUserId,
		username: session.discordUsername || null
	};
}

