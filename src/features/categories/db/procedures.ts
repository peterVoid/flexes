import { DEFAULT_PAGE_SIZE } from "@/constans";
import { db } from "@/db";
import { CategoriesTable } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";
import { categorySchema } from "../schemas/schema";

export const categoryRouter = createTRPCRouter({
  getParentCategories: baseProcedure.query(async () => {
    const parentCategories = await db.query.CategoriesTable.findMany({
      where: isNull(CategoriesTable.parentId),
    });

    return parentCategories;
  }),
  getManyPublic: baseProcedure.query(async () => {
    const categories = await db.query.CategoriesTable.findMany({
      where: isNull(CategoriesTable.parentId),
      columns: { color: true, name: true, slug: true },
      with: {
        subcategories: {
          columns: { name: true, slug: true },
        },
      },
    });

    return categories;
  }),
  getAll: baseProcedure.query(async () => {
    const categories = await db.query.CategoriesTable.findMany({
      columns: { id: true, name: true },
    });

    return categories;
  }),
  create: protectedProcedure
    .input(categorySchema)
    .mutation(async ({ input }) => {
      const { name, slug, color, parent } = input;

      const existingCategory = await db.query.CategoriesTable.findFirst({
        where: eq(CategoriesTable.slug, slug),
      });

      if (existingCategory) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Category already exist",
        });
      }

      const [createdCategory] = await db
        .insert(CategoriesTable)
        .values({
          name,
          slug,
          color,
          parentId: parent == "" ? null : parent,
        })
        .returning();

      return createdCategory;
    }),
  update: protectedProcedure
    .input(
      z
        .object({
          id: z.string().min(1),
        })
        .merge(categorySchema),
    )
    .mutation(async ({ input }) => {
      const { id, name, slug, color, parent } = input;

      const existingCategory = await db.query.CategoriesTable.findFirst({
        where: eq(CategoriesTable.id, id),
      });

      if (!existingCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      const [updatedCategory] = await db
        .update(CategoriesTable)
        .set({
          name,
          slug,
          color,
          parentId: parent == "" ? null : parent,
        })
        .where(eq(CategoriesTable.id, id))
        .returning();

      return updatedCategory;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        pageSize: z.number().default(DEFAULT_PAGE_SIZE),
        page: z.number().default(1),
        ct: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { pageSize, page, ct } = input;

      const offset = (page - 1) * pageSize;

      const categories = await db.query.CategoriesTable.findMany({
        limit: pageSize,
        offset,
        orderBy: desc(CategoriesTable.createdAt),
        where:
          ct === "parent-category"
            ? isNull(CategoriesTable.parentId)
            : ct === "children-category"
              ? isNotNull(CategoriesTable.parentId)
              : undefined,
        with: {
          parent: {
            columns: { name: true },
          },
        },
      });

      const [allCategoriesData] = await db
        .select({
          count: count(),
        })
        .from(CategoriesTable)
        .where(
          and(
            ct === "parent-category"
              ? isNull(CategoriesTable.parentId)
              : undefined,
            ct === "children-category"
              ? isNotNull(CategoriesTable.parentId)
              : undefined,
          ),
        );

      return {
        categories,
        totalPages: Math.ceil(allCategoriesData.count / pageSize),
        hasNextPage: page * pageSize < allCategoriesData.count,
      };
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const [deletedCategory] = await db
        .delete(CategoriesTable)
        .where(eq(CategoriesTable.id, input.id))
        .returning();

      return deletedCategory;
    }),
});
