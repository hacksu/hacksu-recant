CREATE TABLE "redirects" (
	"slug" text PRIMARY KEY NOT NULL,
	"target_url" text NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
