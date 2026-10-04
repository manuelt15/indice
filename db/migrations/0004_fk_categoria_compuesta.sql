-- Un enlace solo puede apuntar a una categoría de su mismo usuario.
-- Las comprobaciones de FK no pasan por Row Level Security, así que la garantía va en la propia FK.
-- Al borrar la categoría, solo category_id pasa a NULL (user_id se mantiene).
ALTER TABLE "link"
  ADD CONSTRAINT "link_category_same_user_fk"
  FOREIGN KEY ("user_id", "category_id")
  REFERENCES "category" ("user_id", "id")
  ON DELETE SET NULL ("category_id");
