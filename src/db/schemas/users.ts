import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helpers";
import { relations } from "drizzle-orm";
import { AddressTable } from "./address";
import { CartTable } from "./cart";
import { OrdersTable } from "./orders";
import { ReviewsTable } from "./reviews";

export const userRoles = ["admin", "user"] as const;
export type UserRoles = (typeof userRoles)[number];
export const UserRolesEnum = pgEnum("user-roles", userRoles);

export const UsersTable = pgTable("users", {
  id,
  clerkId: text().notNull().unique(),
  email: text().notNull(),
  name: text().notNull(),
  role: UserRolesEnum().notNull().default("user"),
  imageUrl: text(),

  createdAt,
  updatedAt,
});

export const UsersRelations = relations(UsersTable, ({ many }) => ({
  address: many(AddressTable),
  cart: many(CartTable),
  orders: many(OrdersTable),
  reviews: many(ReviewsTable),
}));
