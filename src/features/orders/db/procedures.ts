import { DEFAULT_LIMIT, DEFAULT_PAGE_SIZE } from "@/constans";
import { db } from "@/db";
import { ordersStatues, OrdersTable, ReviewsTable } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, lt } from "drizzle-orm";
import { z } from "zod";

export const orderRouter = createTRPCRouter({
  getTotalSales: protectedProcedure.query(async () => {
    const orders = await db.query.OrdersTable.findMany({
      columns: { gross_amount: true },
    });

    return {
      totalOrders: orders.length,
      totalAmountPrice: orders.reduce(
        (acc, item) => acc + item.gross_amount,
        0,
      ),
    };
  }),
  updateOrderStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        value: z.enum(ordersStatues).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, value } = input;

      const [updatedOrder] = await db
        .update(OrdersTable)
        .set({
          status: value,
        })
        .where(eq(OrdersTable.id, id))
        .returning();

      if (!updatedOrder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return updatedOrder;
    }),
  getManyAdmin: protectedProcedure
    .input(
      z.object({
        pageSize: z.number().default(DEFAULT_PAGE_SIZE),
        page: z.number().default(1),
      }),
    )
    .query(async ({ input }) => {
      const { page, pageSize } = input;

      const offset = (page - 1) * pageSize;

      const orders = await db.query.OrdersTable.findMany({
        limit: pageSize,
        offset,
        orderBy: desc(OrdersTable.createdAt),
        with: {
          user: {
            columns: { name: true },
          },
          product: {
            columns: { name: true },
          },
        },
      });

      const [allOrdersData] = await db
        .select({
          count: count(),
        })
        .from(OrdersTable);

      return {
        orders,
        totalPages: Math.ceil(allOrdersData.count / pageSize),
        hasNextPage: page * pageSize < allOrdersData.count,
      };
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.number().nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { user } = ctx;

      const take = limit + 1;

      const myOrders = await db.query.OrdersTable.findMany({
        where: and(
          cursor ? lt(OrdersTable.createdAt, new Date(cursor)) : undefined,
          eq(OrdersTable.hasPaid, true),
          eq(OrdersTable.user_id, user.id),
        ),
        limit: take,
        orderBy: desc(OrdersTable.transaction_time),
        with: {
          product: {
            columns: { id: true, name: true, price: true, imageUrl: true },
            with: {
              reviews: {
                columns: { id: true, rating: true, description: true },
                where: eq(ReviewsTable.userId, user.id),
              },
            },
          },
          address: {
            columns: { complete_address: true },
          },
        },
      });

      let nextCursor: number | undefined = undefined;
      if (myOrders.length === take) {
        const nextParam = myOrders.pop()!;
        nextCursor = nextParam.createdAt.getTime();
      }

      return {
        myOrders,
        nextCursor,
      };
    }),
});
