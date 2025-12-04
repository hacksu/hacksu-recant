CREATE TABLE "information" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"link" text,
	"description" text NOT NULL,
	"photo" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
