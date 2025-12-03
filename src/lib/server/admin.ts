import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// Require that the user has a valid admin_session cookie.
// This cookie is issued in the Discord OAuth callback once
// guild + role checks have passed.
export function requireAdmin(event: RequestEvent) {
	const adminSession = event.cookies.get('admin_session');
	if (adminSession !== '1') {
		throw redirect(302, '/auth/discord');
	}
}

