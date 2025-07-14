import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type AddressGetManyOutput =
  inferRouterOutputs<AppRouter>["address"]["getMany"];

export type Address = AddressGetManyOutput[0];

export type GetMainAddress =
  inferRouterOutputs<AppRouter>["address"]["getMainAddress"];
