import { AnyPgColumn, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helpers";
import { relations } from "drizzle-orm";
import { ProductsTable } from "./products";

export const CategoriesTable = pgTable("categories", {
  id,
  name: text().notNull(),
  slug: text().notNull(),
  color: text(),
  parentId: uuid().references((): AnyPgColumn => CategoriesTable.id, {
    onDelete: "cascade",
  }),

  createdAt,
  updatedAt,
});

export const CategoriesRelations = relations(
  CategoriesTable,
  ({ one, many }) => ({
    parent: one(CategoriesTable, {
      fields: [CategoriesTable.parentId],
      references: [CategoriesTable.id],
      relationName: "subcategories",
    }),

    subcategories: many(CategoriesTable, {
      relationName: "subcategories",
    }),

    products: many(ProductsTable),
  }),
);
