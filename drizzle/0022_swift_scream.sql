CREATE TABLE IF NOT EXISTS "checklist_items" (
	"id" text PRIMARY KEY NOT NULL,
	"item" text NOT NULL,
	"body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"checked_at" timestamp with time zone
);
--> statement-breakpoint
INSERT INTO "checklist_items" ("id", "item", "body", "created_at", "checked_at")
SELECT
	"id",
	"title",
	CASE
		WHEN "tags" IS NULL OR btrim("tags") = '' THEN "notes"
		ELSE "notes" || E'\n\nTags: ' || "tags"
	END,
	"date",
	"date"
FROM "notes"
ON CONFLICT ("id") DO NOTHING;
