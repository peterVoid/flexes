import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helpers";
import { ProductsTable } from "./products";
import { UsersTable } from "./users";
import { relations } from "drizzle-orm";

export const ReviewsTable = pgTable("reviews", {
  id,
  description: text(),
  rating: integer().notNull(),
  productId: uuid()
    .references(() => ProductsTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid()
    .references(() => UsersTable.id, { onDelete: "cascade" })
    .notNull(),

  createdAt,
  updatedAt,
});

export const ReviewsRelations = relations(ReviewsTable, ({ one }) => ({
  product: one(ProductsTable, {
    fields: [ReviewsTable.productId],
    references: [ProductsTable.id],
  }),
  user: one(UsersTable, {
    fields: [ReviewsTable.userId],
    references: [UsersTable.id],
  }),
}));
