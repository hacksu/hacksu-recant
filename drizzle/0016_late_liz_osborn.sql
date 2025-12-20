ALTER TABLE "admin_audit_log" ADD COLUMN "admin_username" text;--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD COLUMN "discord_username" text;