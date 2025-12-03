import { redirect } from '@sveltejs/kit';
import { discord } from '$lib/server/auth';
import { generateState } from 'arctic';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	console.log('[auth/discord/+server] GET /auth/discord handler start');

	const state = generateState();
	console.log('[auth/discord/+server] generated state', state);

	cookies.set('discord_oauth_state', state, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10
	});

	// Request scopes needed to read guild membership and roles
	const scopes = ['identify', 'guilds.members.read'] as const;
	console.log('[auth/discord/+server] calling createAuthorizationURL', {
		state,
		codeVerifier: null,
		scopes
	});

	const redirectURL = await discord.createAuthorizationURL(state, null, [...scopes]);

	console.log('[auth/discord/+server] redirectURL', redirectURL.toString());

	throw redirect(302, redirectURL.toString());
};

