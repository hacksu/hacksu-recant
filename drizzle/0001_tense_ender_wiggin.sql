CREATE TABLE "meetings" (
	"id" text PRIMARY KEY DEFAULT 'current' NOT NULL,
	"discord" text NOT NULL,
	"time" text NOT NULL,
	"building_name" text NOT NULL,
	"building_room" text NOT NULL,
	"building_image" text NOT NULL,
	"building_url" text NOT NULL,
	"body" text,
	"button" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
