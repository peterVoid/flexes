import { integer, pgTable, serial, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helpers";
import { UsersTable } from "./users";
import { ProductsTable } from "./products";
import { relations } from "drizzle-orm";

export const CartTable = pgTable("cart", {
  id,
  sortId: serial("sort_id").notNull(),
  userId: uuid()
    .references(() => UsersTable.id, { onDelete: "cascade" })
    .notNull(),
  productId: uuid()
    .references(() => ProductsTable.id, { onDelete: "cascade" })
    .notNull(),
  quantity: integer().notNull().default(1),

  createdAt,
  updatedAt,
});

export const CartRelations = relations(CartTable, ({ one }) => ({
  user: one(UsersTable, {
    fields: [CartTable.userId],
    references: [UsersTable.id],
  }),
  product: one(ProductsTable, {
    fields: [CartTable.productId],
    references: [ProductsTable.id],
  }),
}));
