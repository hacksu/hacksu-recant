import { Discord } from 'arctic';
import { env } from '$env/dynamic/private';
import { PUBLIC_APP_URL } from '$env/static/public';

if (!env.DISCORD_CLIENT_ID) throw new Error('DISCORD_CLIENT_ID is not set');
if (!env.DISCORD_CLIENT_SECRET) throw new Error('DISCORD_CLIENT_SECRET is not set');
if (!env.DISCORD_GUILD_ID) throw new Error('DISCORD_GUILD_ID is not set');

const appUrl = PUBLIC_APP_URL;

if (!appUrl) throw new Error('PUBLIC_APP_URL is not set');

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
