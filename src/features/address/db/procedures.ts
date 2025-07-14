import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { z } from "zod";
import { addressSchema } from "../schemas/schema";
import { db } from "@/db";
import { AddressTable, UsersTable } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";

export const addressRouter = createTRPCRouter({
  getNotMainAddress: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    const addresses = await db.query.AddressTable.findMany({
      where: and(
        eq(AddressTable.userId, user.id),
        eq(AddressTable.main_address, false),
      ),
      limit: 2,
    });

    return addresses;
  }),
  getMainAddress: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    const address = await db.query.AddressTable.findFirst({
      where: and(
        eq(AddressTable.userId, user.id),
        eq(AddressTable.main_address, true),
      ),
    });

    if (!address) return null;

    return address;
  }),
  create: protectedProcedure
    .input(
      z
        .object({
          province_id: z.string().min(1),
          city_id: z.string().min(1),
        })
        .merge(addressSchema),
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;

      if (input.mainAddress) {
        const [existingMainAddress] = await db
          .select({ id: AddressTable.id })
          .from(AddressTable)
          .where(
            and(
              eq(AddressTable.main_address, true),
              eq(AddressTable.userId, user.id),
            ),
          );

        if (existingMainAddress) {
          await db
            .update(AddressTable)
            .set({ main_address: false })
            .where(
              and(
                eq(AddressTable.id, existingMainAddress.id),
                eq(AddressTable.userId, user.id),
              ),
            )
            .returning();
        }
      }

      const [insertedAddress] = await db
        .insert(AddressTable)
        .values({
          ...input,
          userId: user.id,
          main_address: input.mainAddress,
        })
        .returning();

      if (!insertedAddress) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      return insertedAddress;
    }),
  update: protectedProcedure
    .input(
      z
        .object({
          id: z.string().min(1),
          province_id: z.string().min(1),
          city_id: z.string().min(1),
        })
        .merge(addressSchema),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      if (input.mainAddress) {
        const [existingMainAddress] = await db
          .select()
          .from(AddressTable)
          .where(
            and(
              eq(AddressTable.main_address, true),
              eq(AddressTable.userId, user.id),
            ),
          );

        if (existingMainAddress) {
          await db
            .update(AddressTable)
            .set({ main_address: false })
            .where(
              and(
                eq(AddressTable.main_address, true),
                eq(AddressTable.userId, user.id),
              ),
            )
            .returning();
        }
      }

      const [updatedAddress] = await db
        .update(AddressTable)
        .set({
          ...input,
          main_address: input.mainAddress,
        })
        .where(
          and(eq(AddressTable.id, input.id), eq(AddressTable.userId, user.id)),
        )
        .returning();

      if (!updatedAddress) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      return updatedAddress;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        isMainAddress: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, isMainAddress } = input;

      const { user } = ctx;

      if (isMainAddress) {
        const [notMainAddress] = await db
          .select()
          .from(AddressTable)
          .where(
            and(
              eq(AddressTable.userId, user.id),
              eq(AddressTable.main_address, false),
            ),
          )
          .orderBy(desc(AddressTable.createdAt))
          .limit(1);

        await db
          .update(AddressTable)
          .set({ main_address: true })
          .where(
            and(
              eq(AddressTable.userId, user.id),
              notMainAddress
                ? eq(AddressTable.id, notMainAddress.id)
                : undefined,
            ),
          )
          .returning();
      }

      const [deletedAddress] = await db
        .delete(AddressTable)
        .where(and(eq(AddressTable.userId, user.id), eq(AddressTable.id, id)))
        .returning();

      return deletedAddress;
    }),
  getMany: baseProcedure.query(async () => {
    const { userId } = await auth();

    if (!userId) return [];

    const existingUser = await db.query.UsersTable.findFirst({
      where: eq(UsersTable.clerkId, userId),
      columns: { id: true },
    });

    if (!existingUser) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const address = await db.query.AddressTable.findMany({
      columns: {
        city: true,
        city_id: true,
        complete_address: true,
        id: true,
        label: true,
        main_address: true,
        phone_number: true,
        postal_code: true,
        province: true,
        province_id: true,
        receiver_name: true,
        subdistrict: true,
      },
      where: eq(AddressTable.userId, existingUser.id),
      orderBy: desc(AddressTable.createdAt),
    });

    return address;
  }),
});
