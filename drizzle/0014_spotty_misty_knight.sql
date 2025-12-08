CREATE TABLE "lesson_icons" (
	"category_name" text PRIMARY KEY NOT NULL,
	"iconify_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
