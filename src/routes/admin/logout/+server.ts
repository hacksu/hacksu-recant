import { redirect } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

import { db } from '$lib/server/db';

import { adminSessions } from '$lib/server/db/schema';

import { eq } from 'drizzle-orm';



export const POST: RequestHandler = async (event) => {

	const sessionId = event.cookies.get('admin_session');



	if (sessionId) {

		await db.delete(adminSessions).where(eq(adminSessions.id, sessionId));

	}



	// Clear the admin_session cookie and send the user home

	event.cookies.delete('admin_session', { path: '/' });

	throw redirect(302, '/');

};

