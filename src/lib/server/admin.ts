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

