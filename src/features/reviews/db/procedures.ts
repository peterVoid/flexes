import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { reviewSchema } from "../schemas/schema";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { ProductsTable, ReviewsTable } from "@/db/schema";
import { TRPCError } from "@trpc/server";

export const reviewRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z
        .object({
          productId: z.string().min(1),
        })
        .merge(reviewSchema),
    )
    .mutation(async ({ input, ctx }) => {
      const { description, productId, rating } = input;
      const { user } = ctx;

      const product = await db.query.ProductsTable.findFirst({
        where: eq(ProductsTable.id, productId),
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const existingReviews = await db.query.ReviewsTable.findFirst({
        where: and(
          eq(ReviewsTable.productId, productId),
          eq(ReviewsTable.userId, user.id),
        ),
      });

      if (existingReviews) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already rating this product",
        });
      }

      const review = await db
        .insert(ReviewsTable)
        .values({
          productId,
          description,
          rating,
          userId: user.id,
        })
        .returning();

      return review;
    }),
  update: protectedProcedure
    .input(
      z
        .object({
          productId: z.string().min(1),
        })
        .merge(reviewSchema),
    )
    .mutation(async ({ input, ctx }) => {
      const { description, productId, rating } = input;
      const { user } = ctx;

      const product = await db.query.ProductsTable.findFirst({
        where: eq(ProductsTable.id, productId),
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const existingReviews = await db.query.ReviewsTable.findFirst({
        where: and(
          eq(ReviewsTable.productId, productId),
          eq(ReviewsTable.userId, user.id),
        ),
      });

      if (!existingReviews) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reviews not found",
        });
      }

      const review = await db
        .update(ReviewsTable)
        .set({
          description,
          rating,
        })
        .where(
          and(
            eq(ReviewsTable.userId, user.id),
            eq(ReviewsTable.productId, productId),
          ),
        )
        .returning();

      return review;
    }),
  getOne: protectedProcedure
    .input(
      z.object({
        productId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { productId } = input;
      const { user } = ctx;

      const getReview = await db.query.ReviewsTable.findFirst({
        where: and(
          eq(ReviewsTable.userId, user.id),
          eq(ReviewsTable.productId, productId),
        ),
      });

      if (!getReview) return null;

      return getReview;
    }),
});
