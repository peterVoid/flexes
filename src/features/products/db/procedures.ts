import { DEFAULT_LIMIT, DEFAULT_PAGE_SIZE } from "@/constans";
import { db } from "@/db";
import { CategoriesTable, ProductsTable } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lt,
  lte,
} from "drizzle-orm";
import { z } from "zod";
import { productSchema } from "../schemas/schema";

export const productRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        productId: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const { productId } = input;

      const getProduct = await db.query.ProductsTable.findFirst({
        columns: {
          id: true,
          name: true,
          imageUrl: true,
          stock: true,
          price: true,
          description: true,
        },
        where: eq(ProductsTable.id, productId),
        with: {
          category: {
            columns: { name: true },
          },
          reviews: true,
        },
      });

      if (!getProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return getProduct;
    }),
  getManyPublic: baseProcedure
    .input(
      z.object({
        cursor: z.number().nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        stock: z.string().optional(),
        category: z.string().optional(),
        subcategory: z.string().optional(),
        sort: z.string().optional(),
        q: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const {
        cursor,
        limit,
        maxPrice,
        minPrice,
        stock,
        category,
        subcategory,
        sort,
        q,
      } = input;

      const take = limit + 1;

      let categoriesIds = [];

      if (category) {
        const getCategory = await db.query.CategoriesTable.findFirst({
          columns: { id: true },
          where: eq(CategoriesTable.slug, category),
          with: {
            subcategories: {
              columns: { id: true },
            },
          },
        });

        if (!getCategory)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });

        categoriesIds.push(getCategory.id);

        getCategory.subcategories.forEach((cId) => {
          categoriesIds.push(cId.id);
        });
      }

      if (subcategory) {
        categoriesIds = [];
        const getCategoryId = await db.query.CategoriesTable.findFirst({
          columns: { id: true },
          where: eq(CategoriesTable.slug, subcategory),
        });

        if (!getCategoryId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }

        categoriesIds.push(getCategoryId?.id);
      }

      let orderBy = desc(ProductsTable.createdAt);

      if (sort === "latest") {
        orderBy = desc(ProductsTable.createdAt);
      } else if (sort === "oldest") {
        orderBy = asc(ProductsTable.createdAt);
      } else {
        orderBy = desc(ProductsTable.soldCount);
      }

      const products = await db.query.ProductsTable.findMany({
        where: and(
          eq(ProductsTable.isArchived, false),
          cursor ? lt(ProductsTable.createdAt, new Date(cursor)) : undefined,
          minPrice ? gte(ProductsTable.price, minPrice) : undefined,
          maxPrice ? lte(ProductsTable.price, maxPrice) : undefined,
          stock
            ? stock === "in-stock"
              ? gte(ProductsTable.stock, 1)
              : eq(ProductsTable.stock, 0)
            : undefined,
          category
            ? inArray(ProductsTable.categoryId, categoriesIds)
            : undefined,
          q ? ilike(ProductsTable.name, `%${q}%`) : undefined,
        ),
        orderBy,
        columns: {
          id: true,
          name: true,
          imageUrl: true,
          price: true,
          stock: true,
          createdAt: true,
          description: true,
          content: true,
          isArchived: true,
        },
        with: {
          category: {
            columns: { id: true, name: true },
          },
          reviews: {
            columns: { rating: true },
          },
        },
        limit: take,
      });

      let nextCursor: number | undefined = undefined;
      if (products.length === take) {
        const nextitem = products.pop()!;
        nextCursor = nextitem.createdAt.getTime();
      }

      return {
        products,
        nextCursor,
      };
    }),
  getManyAdmin: protectedProcedure
    .input(
      z.object({
        pageSize: z.number().default(DEFAULT_PAGE_SIZE),
        page: z.number().default(1),
        q: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { page, pageSize, q } = input;

      const offset = (page - 1) * pageSize;

      const products = await db.query.ProductsTable.findMany({
        limit: pageSize,
        offset,
        columns: {
          id: true,
          name: true,
          imageUrl: true,
          price: true,
          stock: true,
          isArchived: true,
          content: true,
          description: true,
        },
        where: q ? ilike(ProductsTable.name, `%${q}%`) : undefined,
        with: {
          category: {
            columns: { id: true, name: true },
          },
        },
      });

      const [allProductsData] = await db
        .select({
          count: count(),
        })
        .from(ProductsTable);

      return {
        products,
        totalPages: Math.ceil(allProductsData.count / pageSize),
        hasNextPage: page * pageSize < allProductsData.count,
      };
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const [deletedProduct] = await db
        .delete(ProductsTable)
        .where(eq(ProductsTable.id, input.id))
        .returning();

      return deletedProduct;
    }),
  update: protectedProcedure
    .input(z.object({ id: z.string().min(1) }).merge(productSchema))
    .mutation(async ({ input }) => {
      const [updatedProduct] = await db
        .update(ProductsTable)
        .set(input)
        .where(eq(ProductsTable.id, input.id))
        .returning();

      return updatedProduct;
    }),
  create: protectedProcedure
    .input(productSchema)
    .mutation(async ({ input }) => {
      const [createdProduct] = await db
        .insert(ProductsTable)
        .values({
          name: input.name,
          categoryId: input.categoryId,
          description: input.description,
          price: input.price,
          content: input.content,
          imageUrl: input.imageUrl !== "" ? input.imageUrl : null,
          stock: input.stock,
          isArchived: input.isArchived,
        })
        .returning();

      return createdProduct;
    }),
});
