-- Rol de la app en ejecución: sin privilegios de dueño, así que Row Level Security le aplica siempre.
-- La contraseña NO va aquí: la fija scripts/create-app-role.ts y se guarda solo en .env.local / Vercel.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'indice_app') THEN
    CREATE ROLE indice_app NOLOGIN;
  END IF;
END
$$;--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO indice_app;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO indice_app;--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO indice_app;--> statement-breakpoint
-- Segunda barrera: RLS también para el dueño de las tablas.
ALTER TABLE "category" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "link" FORCE ROW LEVEL SECURITY;
