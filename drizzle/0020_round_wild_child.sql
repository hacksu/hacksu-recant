CREATE TABLE "email_drafts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"to_addresses" text[] DEFAULT '{}' NOT NULL,
	"cc_addresses" text[] DEFAULT '{}' NOT NULL,
	"bcc_addresses" text[] DEFAULT '{}' NOT NULL,
	"from_name" text DEFAULT '' NOT NULL,
	"shared_variables" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"recipient_variables" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"variable_names" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
