import { sql } from "drizzle-orm"
import {
  bigint,
  boolean,
  customType,
  doublePrecision,
  index,
  integer,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" })

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

/* ------------------------------------------------------------------ */
/* Tablas de Better Auth. Sin RLS: solo las usa el servidor de auth.  */
/* ------------------------------------------------------------------ */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // Solo la ciudad y su centro; nunca la ubicación exacta del usuario.
  city: text("city"),
  cityCountry: text("city_country"), // código ISO de 2 letras
  cityLat: doublePrecision("city_lat"),
  cityLng: doublePrecision("city_lng"),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  ...timestamps,
})

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [index("session_user_id_idx").on(t.userId)]
)

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [index("account_user_id_idx").on(t.userId)]
)

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)]
)

export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
})

/* ------------------------------------------------------------------ */
/* Datos de cada usuario. Row Level Security forzada (ver migración). */
/* ------------------------------------------------------------------ */

/** El usuario de la petición, fijado por lib/dal en cada transacción. */
const isOwner = sql`user_id = current_setting('app.user_id', true)`

export const category = pgTable(
  "category",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    position: integer("position").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("category_user_slug_idx").on(t.userId, t.slug),
    uniqueIndex("category_user_id_idx").on(t.userId, t.id),
    pgPolicy("category_owner", { for: "all", to: "public", using: isOwner, withCheck: isOwner }),
  ]
).enableRLS()

export const link = pgTable(
  "link",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    normalizedUrl: text("normalized_url").notNull(),
    name: text("name").notNull(),
    title: text("title"),
    // FK compuesta (user_id, category_id) → category(user_id, id) en la migración 0004:
    // un enlace solo puede apuntar a categorías de su mismo usuario.
    categoryId: text("category_id"),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    pinned: boolean("pinned").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("link_user_url_idx").on(t.userId, t.normalizedUrl),
    index("link_user_created_idx").on(t.userId, t.createdAt),
    pgPolicy("link_owner", { for: "all", to: "public", using: isOwner, withCheck: isOwner }),
  ]
).enableRLS()

/* ------------------------------------------------------------------ */
/* Caché global de favicons, solo de servidor. Sin datos de usuarios: */
/* guarda el icono de cada dominio, no quién lo guardó.               */
/* ------------------------------------------------------------------ */

export const faviconCache = pgTable("favicon_cache", {
  host: text("host").primaryKey(),
  data: bytea("data"),
  contentType: text("content_type"),
  missing: boolean("missing").notNull().default(false),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
})
