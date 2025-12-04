import { redirect, error } from '@sveltejs/kit';
import { discord } from '$lib/server/auth';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import crypto from 'node:crypto';
import { db } from '$lib/server/db';
import { adminSessions } from '$lib/server/db/schema';


export const GET: RequestHandler = async ({ url, cookies }) => {
	console.log('[auth/discord/callback] handler start');
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('discord_oauth_state');

	console.log('[auth/discord/callback] query/cookies', {
		codePresent: Boolean(code),
		state,
		storedState
	});

	if (!code || !state || !storedState || state !== storedState) {
		console.log('[auth/discord/callback] invalid request params');
		throw error(400, 'Invalid request');
	}

	try {
		console.log('[auth/discord/callback] validating authorization code');
		const tokens = await discord.validateAuthorizationCode(code, null);
		console.log('[auth/discord/callback] got tokens', {
			accessTokenPresent:
				typeof tokens.accessToken === 'function' ? Boolean(tokens.accessToken()) : false,
			refreshTokenPresent:
				typeof tokens.refreshToken === 'function' ? Boolean(tokens.refreshToken()) : false
		});

		// Fetch the Discord user using the access token
		const userResponse = await fetch('https://discord.com/api/users/@me', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`
			}
		});

		if (!userResponse.ok) {
			throw error(500, 'Failed to fetch Discord user');
		}

		const discordUser: { id: string; username: string; avatar: string | null } =
			await userResponse.json();

		// Fetch guild member info (includes roles) using the user's access token.
		// Requires the `guilds.members.read` scope, which we request in the auth flow.
		const guildMemberResponse = await fetch(
			`https://discord.com/api/v10/users/@me/guilds/${env.DISCORD_GUILD_ID}/member`,
			{
				headers: {
					Authorization: `Bearer ${tokens.accessToken()}`
				}
			}
		);

		if (!guildMemberResponse.ok) {
			if (guildMemberResponse.status === 404) {
				// User is not a member of the required guild
				throw error(403, 'You must be a member of the required Discord server');
			}
			throw error(500, 'Failed to fetch Discord guild membership');
		}

		const member: { roles?: string[] } = await guildMemberResponse.json();
		const userRoles: string[] = member.roles ?? [];
		// Check if user has required roles (space-separated IDs in DISCORD_ROLES)
		const requiredRoles = env.DISCORD_ROLES?.split(' ').filter(Boolean) || [];
		if (requiredRoles.length > 0) {
			const hasRequiredRole = userRoles.some((role) => requiredRoles.includes(role));
			if (!hasRequiredRole) {
				throw error(403, 'You do not have the required Discord roles');
			}
		}

		// At this point the user is in the required guild and has
		// one of the required roles. Create a DB-backed admin session.
		const sessionId = crypto.randomUUID();
		const now = new Date();
		const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 4); // 4 hours

		await db.insert(adminSessions).values({
			id: sessionId,
			discordUserId: discordUser.id,
			isAdmin: true,
			createdAt: now,
			expiresAt
		});

		cookies.set('admin_session', sessionId, {
			path: '/',
			httpOnly: true,
			secure: import.meta.env.PROD,
			maxAge: 60 * 60 * 4 // 4 hours
		});
		// Clean up OAuth state cookie
		cookies.delete('discord_oauth_state', { path: '/' });
		throw redirect(302, '/admin');
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e && typeof e.status === 'number') {
			throw e;
		}
		console.error('Discord OAuth error:', e);
		throw error(500, 'Failed to authenticate with Discord');
	}
};

