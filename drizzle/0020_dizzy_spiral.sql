CREATE TABLE "course_schedule" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"day" text,
	"time" text,
	"lecturer" text,
	"location" text,
	"email" text,
	"scraped_at" timestamp with time zone NOT NULL
);
