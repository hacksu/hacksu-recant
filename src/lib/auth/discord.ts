import { Arctic } from "arctic";

export const discord = new Arctic(
	"Discord",
	process.env.DISCORD_CLIENT_ID!,
	process.env.DISCORD_CLIENT_SECRET!,
	process.env.DISCORD_REDIRECT_URI || "http://localhost:5173/auth/callback"
);

