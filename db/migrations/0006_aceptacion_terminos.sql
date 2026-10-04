ALTER TABLE "user" ADD COLUMN "terms_accepted_at" timestamp with time zone;--> statement-breakpoint
-- Minimización: índice no usa la foto de perfil ni los tokens de Google y GitHub. Se borran los guardados hasta ahora
-- (los nuevos tokens se guardan cifrados, ver lib/auth.ts).
UPDATE "user" SET "image" = NULL;--> statement-breakpoint
UPDATE "account" SET "access_token" = NULL, "refresh_token" = NULL, "id_token" = NULL;
