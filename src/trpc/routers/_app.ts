import { authRouter } from "@/features/auth/server/procedures";
import { createTRPCRouter } from "../init";
import { categoryRouter } from "@/features/categories/db/procedures";
import { addressRouter } from "@/features/address/db/procedures";
import { productRouter } from "@/features/products/db/procedures";
import { cartRouter } from "@/features/cart/db/procedures";
import { orderRouter } from "@/features/orders/db/procedures";
import { reviewRouter } from "@/features/reviews/db/procedures";
import { userRouter } from "@/features/users/db/procedures";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  categories: categoryRouter,
  address: addressRouter,
  products: productRouter,
  cart: cartRouter,
  orders: orderRouter,
  reviews: reviewRouter,
  users: userRouter,
});

export type AppRouter = typeof appRouter;
