import { Arctic } from "arctic";
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_APP_URL } from "$env/static/public";

export const discord = new Arctic(
	"Discord",
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
	`${PUBLIC_APP_URL}/auth/callback`
);
