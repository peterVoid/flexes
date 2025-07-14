import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type ProductsGetManyAdminOutput =
  inferRouterOutputs<AppRouter>["products"]["getManyAdmin"];

export type Product = {
  name: string;
  id: string;
  imageUrl: string | null;
  description: string | null;
  price: number;
  stock: number;
  createdAt: Date;
  content: string | null;
  isArchived: boolean | null;
  category: {
    name: string;
    id: string;
  };
  reviews: {
    rating: number;
  }[];
};
