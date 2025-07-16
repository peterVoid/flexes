"use client";

import { DEFAULT_LIMIT } from "@/constans";
import { useInterSectionObserver } from "@/hooks/use-intersection-observer";
import { useTRPC } from "@/trpc/client";
import { useAuth } from "@clerk/nextjs";
import {
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { BookX } from "lucide-react";
import { useEffect, useRef } from "react";
import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";

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
  q,
  sort,
}: Props) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { isSignedIn } = useAuth();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } =
    useSuspenseInfiniteQuery(
      trpc.products.getManyPublic.infiniteQueryOptions(
        {
          limit: DEFAULT_LIMIT,
          minPrice: Number(minPrice ?? ""),
          maxPrice: Number(maxPrice ?? ""),
          stock,
          category,
          subcategory,
          q,
          sort,
        },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
      ),
    );

  useEffect(() => {
    if (!isSignedIn) {
      queryClient.invalidateQueries(trpc.auth.session.queryOptions());
    }
  }, [isSignedIn, queryClient, trpc.auth.session]);

  useInterSectionObserver({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    loadMoreRef,
  });

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

  if (isFetchingNextPage || isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {[1, 2, 3, 4, 5].map((_, i) => (
          <Skeleton key={i} className="h-80 w-[250px] bg-slate-500" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {hasNextPage && <div ref={loadMoreRef} className="h-10" />}
    </div>
  );
}
