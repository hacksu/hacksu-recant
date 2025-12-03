import type { Handle } from '@sveltejs/kit';

// No global auth/session handling needed for now.
// Admin protection is done via the `admin_session` cookie
// in `$lib/server/admin.ts`.
export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};
