"use client";

import { DEFAULT_LIMIT } from "@/constans";
import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { ProductCard } from "./product-card";
import { BookX } from "lucide-react";

interface Props {
  minPrice?: string;
  maxPrice?: string;
  stock?: string;
  category?: string;
  subcategory?: string;
  sort?: string;
  q?: string;
}

export function ProductLists({
  minPrice,
  maxPrice,
  stock,
  category,
  subcategory,
  sort,
  q,
}: Props) {
  const trpc = useTRPC();
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      trpc.products.getManyPublic.infiniteQueryOptions(
        {
          limit: DEFAULT_LIMIT,
          minPrice: Number(minPrice ?? ""),
          maxPrice: Number(maxPrice ?? ""),
          stock,
          category,
          subcategory,
          sort,
          q,
        },
        {
          getNextPageParam: (lastItem) => lastItem.nextCursor,
        },
      ),
    );

  const products = data.pages.flatMap((p) => p.products);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-y-4 rounded-md border-2 bg-white px-3 py-5">
        <BookX className="size-10" />
        <div className="text-xl font-semibold">
          UPSSS, Product does not exist yet.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
