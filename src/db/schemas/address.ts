import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helpers";
import { UsersTable } from "./users";
import { relations } from "drizzle-orm";
import { OrdersTable } from "./orders";

export const AddressTable = pgTable("adress", {
  id,
  receiver_name: text().notNull(),
  phone_number: text().notNull(),
  label: text().notNull(),
  province: text().notNull(),
  province_id: text().notNull(),
  city: text().notNull(),
  city_id: text().notNull(),
  subdistrict: text().notNull(),
  postal_code: text().notNull(),
  complete_address: text().notNull(),
  main_address: boolean().default(false),
  userId: uuid().references(() => UsersTable.id, { onDelete: "cascade" }),

  createdAt,
  updatedAt,
});

export const AddressRelations = relations(AddressTable, ({ one, many }) => ({
  user: one(UsersTable, {
    fields: [AddressTable.userId],
    references: [UsersTable.id],
  }),
  orders: many(OrdersTable),
}));
