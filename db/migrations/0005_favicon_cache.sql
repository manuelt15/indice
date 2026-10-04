CREATE TABLE "favicon_cache" (
	"host" text PRIMARY KEY NOT NULL,
	"data" "bytea",
	"content_type" text,
	"missing" boolean DEFAULT false NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
