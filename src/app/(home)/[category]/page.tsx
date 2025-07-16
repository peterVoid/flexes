import { DEFAULT_LIMIT } from "@/constans";
import { FilterProducts } from "@/features/home/components/filter-products";
import { ProductLists } from "@/features/products/components/product-lists";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{
    minPrice?: string;
    maxPrice?: string;
    stock?: string;
  }>;
  params: Promise<{ category: string }>;
}

export const dynamic = "force-dynamic";

export default async function Home({ searchParams, params }: Props) {
  const { minPrice, maxPrice, stock } = await searchParams;
  const { category } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getManyPublic.infiniteQueryOptions(
      {
        limit: DEFAULT_LIMIT,
        minPrice: Number(minPrice ?? ""),
        maxPrice: Number(maxPrice ?? ""),
        stock,
        category,
      },
      {
        getNextPageParam: (lastItem) => lastItem.nextCursor,
      },
    ),
  );

  return (
    <div className="px-12 py-8">
      <div className="flex justify-between">
        <h1 className="text-3xl">Curated For you</h1>
        <span>Sorting</span>
      </div>
      <div className="my-8 grid grid-cols-7 gap-6">
        <div className="col-span-2">
          <Suspense>
            <FilterProducts
              defaultMinPrice={minPrice}
              defaultMaxPrice={maxPrice}
            />
          </Suspense>
        </div>
        <div className="col-span-5">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense>
              <ProductLists
                minPrice={minPrice}
                maxPrice={maxPrice}
                stock={stock}
                category={category}
              />
            </Suspense>
          </HydrationBoundary>
        </div>
      </div>
    </div>
  );
}
