CREATE TABLE "admin_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"discord_user_id" text NOT NULL,
	"is_admin" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
