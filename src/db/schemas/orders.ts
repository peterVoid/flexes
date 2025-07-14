import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helpers";
import { ProductsTable } from "./products";
import { UsersTable } from "./users";
import { AddressTable } from "./address";

export const ordersStatues = [
  "pending",
  "paid",
  "shipped",
  "completed",
] as const;
export type OrderStatus = (typeof ordersStatues)[number];
export const OrderStatus = pgEnum("isPublished", ordersStatues);

export const OrdersTable = pgTable("orders", {
  id,
  order_id: text().notNull(),
  user_id: uuid()
    .references(() => UsersTable.id, { onDelete: "cascade" })
    .notNull(),
  gross_amount: integer().notNull(),
  quantity: integer().notNull(),
  productId: uuid()
    .references(() => ProductsTable.id, { onDelete: "cascade" })
    .notNull(),
  addressId: uuid()
    .references(() => AddressTable.id, { onDelete: "cascade" })
    .notNull(),
  courier: text().notNull(),
  payment_type: text(),
  transaction_time: timestamp().notNull(),
  settlement_time: timestamp(),
  hasPaid: boolean().default(false).notNull(),
  currency: text(),
  shippingAmount: integer().default(0).notNull(),
  status: OrderStatus().default("pending").notNull(),

  createdAt,
  updatedAt,
});

export const OrdersRelations = relations(OrdersTable, ({ one }) => ({
  user: one(UsersTable, {
    fields: [OrdersTable.user_id],
    references: [UsersTable.id],
  }),
  product: one(ProductsTable, {
    fields: [OrdersTable.productId],
    references: [ProductsTable.id],
  }),
  address: one(AddressTable, {
    fields: [OrdersTable.addressId],
    references: [AddressTable.id],
  }),
}));
