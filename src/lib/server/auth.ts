import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Discord } from 'arctic';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { env } from '$env/dynamic/private';

if (!env.DISCORD_CLIENT_ID) throw new Error('DISCORD_CLIENT_ID is not set');
if (!env.DISCORD_CLIENT_SECRET) throw new Error('DISCORD_CLIENT_SECRET is not set');
if (!env.DISCORD_GUILD_ID) throw new Error('DISCORD_GUILD_ID is not set');

const adapter = new DrizzlePostgreSQLAdapter(db, schema.session, schema.user);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: import.meta.env.PROD
		}
	},
	getUserAttributes: (attributes) => {
		return {
			discordId: attributes.discordId,
			username: attributes.username,
			avatar: attributes.avatar,
			roles: attributes.roles
		};
	}
});

const appUrl = env.PUBLIC_APP_URL || 'http://localhost:3000';

console.log('[auth.ts] Initializing Discord OAuth client', {
	appUrl,
	redirectURI: `${appUrl}/auth/discord/callback`,
	clientIdPrefix: env.DISCORD_CLIENT_ID?.slice(0, 5) ?? 'none',
	clientSecretSet: Boolean(env.DISCORD_CLIENT_SECRET)
});

export const discord = new Discord(
	env.DISCORD_CLIENT_ID,
	env.DISCORD_CLIENT_SECRET,
	`${appUrl}/auth/discord/callback`
);

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			discordId: string;
			username: string;
			avatar: string | null;
			roles: string[];
		};
	}
}
