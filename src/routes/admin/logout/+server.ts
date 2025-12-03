import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	// Clear the simple admin_session cookie and send the user home
	event.cookies.delete('admin_session', { path: '/' });
	throw redirect(302, '/');
};
