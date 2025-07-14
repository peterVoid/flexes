import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type Category = {
  name: string;
  slug: string;
  color: string | null;
  subcategories: {
    name: string;
    slug: string;
  }[];
};

export type CategoriesGetManyOutput =
  inferRouterOutputs<AppRouter>["categories"]["getMany"];

export type CategoriesGetManyOutputModify = Omit<
  CategoriesGetManyOutput,
  "totalPages" | "hasNextPage"
>;

export type CategoryGetOneForm = {
  color: string | null;
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  parentId: string | null;
  parent: {
    name: string;
  } | null;
};
