import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helpers";
import { CategoriesTable } from "./categories";
import { CartTable } from "./cart";
import { OrdersTable } from "./orders";
import { ReviewsTable } from "./reviews";

export const ProductsTable = pgTable("products", {
  id,
  sortId: serial("sort_id").notNull(),
  name: text().notNull(),
  description: text(),
  price: integer().notNull(),
  categoryId: uuid()
    .references(() => CategoriesTable.id, {
      onDelete: "restrict",
    })
    .notNull(),
  imageUrl: text(),
  stock: integer().default(0).notNull(),
  content: text(),
  isArchived: boolean().default(false),
  soldCount: integer().default(0),

  createdAt,
  updatedAt,
});

export const ProductsRelations = relations(ProductsTable, ({ one, many }) => ({
  category: one(CategoriesTable, {
    fields: [ProductsTable.categoryId],
    references: [CategoriesTable.id],
  }),
  cart: many(CartTable),
  orders: many(OrdersTable),
  reviews: many(ReviewsTable),
}));
