"use client";

import { DEFAULT_LIMIT } from "@/constans";
import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { BookX, Loader2Icon } from "lucide-react";
import { useEffect, useRef } from "react";
import { ProductCard } from "./product-card";

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

  const trpc = useTRPC();
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
    const loadMoreNode = loadMoreRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "100px",
      },
    );

    if (loadMoreNode) {
      observer.observe(loadMoreNode);
    }

    return () => {
      if (loadMoreNode) {
        observer.unobserve(loadMoreNode);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
      <div className="flex items-center justify-center">
        <Loader2Icon className="animate-spin" />
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
