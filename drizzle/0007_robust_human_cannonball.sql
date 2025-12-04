CREATE TABLE "leadership" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"grad_year" integer NOT NULL,
	"grad_term" text NOT NULL,
	"github" text,
	"photo" text,
	"titles" text[] NOT NULL,
	"link" text,
	"is_current" boolean DEFAULT false NOT NULL
);
