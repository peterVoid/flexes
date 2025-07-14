import { DEFAULT_LIMIT } from "@/constans";
import { db } from "@/db";
import { CartTable, UsersTable } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, lt } from "drizzle-orm";
import { z } from "zod";

export const cartRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.number().nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const { user } = ctx;

      const take = limit + 1;

      const carts = await db.query.CartTable.findMany({
        where: and(
          eq(CartTable.userId, user.id),
          cursor ? lt(CartTable.createdAt, new Date(cursor)) : undefined,
        ),
        orderBy: desc(CartTable.createdAt),
        limit: take,
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              stock: true,
            },
          },
        },
      });

      let nextCursor: number | undefined = undefined;
      if (carts.length === take) {
        const nextItem = carts.pop()!;
        nextCursor = nextItem.createdAt.getTime();
      }

      return {
        carts,
        nextCursor,
      };
    }),
  remove: protectedProcedure
    .input(
      z.object({
        productId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { productId } = input;
      const { user } = ctx;

      const existingProduct = await db.query.CartTable.findFirst({
        where: and(
          eq(CartTable.userId, user.id),
          eq(CartTable.productId, productId),
        ),
      });

      if (!existingProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const [deletedProductCart] = await db
        .delete(CartTable)
        .where(
          and(
            eq(CartTable.userId, user.id),
            eq(CartTable.productId, productId),
          ),
        )
        .returning();

      return deletedProductCart;
    }),
  decreaseQuantity: protectedProcedure
    .input(
      z.object({
        productId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { productId } = input;
      const { user } = ctx;

      const getQtyCartByProductId = await db.query.CartTable.findFirst({
        columns: { quantity: true },
        where: and(
          eq(CartTable.userId, user.id),
          eq(CartTable.productId, productId),
        ),
      });

      if (!getQtyCartByProductId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart not found",
        });
      }

      const newQty = getQtyCartByProductId.quantity - 1;

      const [updatedQuantity] = await db
        .update(CartTable)
        .set({
          quantity: newQty,
        })
        .where(
          and(
            eq(CartTable.productId, productId),
            eq(CartTable.userId, user.id),
          ),
        )
        .returning();

      return updatedQuantity;
    }),
  increaseQuantity: protectedProcedure
    .input(
      z.object({
        productId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { productId } = input;
      const { user } = ctx;

      const getQtyCartByProductId = await db.query.CartTable.findFirst({
        columns: { quantity: true },
        where: and(
          eq(CartTable.userId, user.id),
          eq(CartTable.productId, productId),
        ),
      });

      if (!getQtyCartByProductId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart not found",
        });
      }

      const newQty = getQtyCartByProductId.quantity + 1;

      const [updatedQuantity] = await db
        .update(CartTable)
        .set({
          quantity: newQty,
        })
        .where(
          and(
            eq(CartTable.productId, productId),
            eq(CartTable.userId, user.id),
          ),
        )
        .returning();

      return updatedQuantity;
    }),
  addToCart: protectedProcedure
    .input(
      z.object({
        productId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { productId } = input;
      const { user } = ctx;

      const [addedToCart] = await db
        .insert(CartTable)
        .values({
          productId,
          userId: user.id,
          quantity: 1,
        })
        .onConflictDoNothing()
        .returning();

      return addedToCart;
    }),
  isProductInCart: baseProcedure
    .input(
      z.object({
        productId: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const { productId } = input;
      const { userId } = await auth();

      if (!userId) return false;

      const [currentUser] = await db
        .select()
        .from(UsersTable)
        .where(eq(UsersTable.clerkId, userId));

      if (!currentUser.id) return false;

      const [productInCart] = await db
        .select()
        .from(CartTable)
        .where(
          and(
            eq(CartTable.userId, currentUser.id),
            eq(CartTable.productId, productId),
          ),
        )
        .limit(1);

      return productInCart != null;
    }),
});
