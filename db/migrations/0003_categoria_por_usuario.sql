ALTER TABLE "link" DROP CONSTRAINT "link_category_id_category_id_fk";
--> statement-breakpoint
CREATE UNIQUE INDEX "category_user_id_idx" ON "category" USING btree ("user_id","id");