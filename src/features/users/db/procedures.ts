import { DEFAULT_PAGE_SIZE } from "@/constans";
import { db } from "@/db";
import { UsersTable } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        pageSize: z.number().default(DEFAULT_PAGE_SIZE),
        page: z.number().default(1),
        q: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { pageSize, page, q } = input;

      const offset = (page - 1) * pageSize;

      const users = await db.query.UsersTable.findMany({
        limit: pageSize,
        offset,
        orderBy: desc(UsersTable.createdAt),
        where: and(
          eq(UsersTable.role, "user"),
          q ? ilike(UsersTable.name, `%${q}%`) : undefined,
        ),
      });

      const [allUsersData] = await db
        .select({
          count: count(),
        })
        .from(UsersTable)
        .where(eq(UsersTable.role, "user"));

      return {
        users,
        totalPages: Math.ceil(allUsersData.count / pageSize),
        hasNextPage: page * pageSize < allUsersData.count,
      };
    }),
});
