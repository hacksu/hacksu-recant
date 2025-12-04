CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"presenter" text,
	"link" text,
	"description_md" text,
	"description_html" text,
	"photo" text
);
