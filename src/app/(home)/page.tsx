import { DEFAULT_LIMIT } from "@/constans";
import { FilterProducts } from "@/features/home/components/filter-products";
import { SortingProducts } from "@/features/home/components/sorting-products";
import { ProductLists } from "@/features/products/components/product-lists";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{
    minPrice?: string;
    maxPrice?: string;
    stock?: string;
    q?: string;
    sort?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: Props) {
  const { minPrice, maxPrice, stock, q, sort } = await searchParams;

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getManyPublic.infiniteQueryOptions(
      {
        limit: DEFAULT_LIMIT,
        minPrice: Number(minPrice ?? ""),
        maxPrice: Number(maxPrice ?? ""),
        stock,
        q,
        sort,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  return (
    <div className="px-12 py-8">
      <div className="flex justify-between">
        <h1 className="text-3xl">Curated For you</h1>
        <SortingProducts />
      </div>
      <div className="my-8 grid grid-cols-1 gap-6 lg:grid-cols-7">
        <div className="lg:col-span-2">
          <Suspense>
            <FilterProducts
              defaultMinPrice={minPrice}
              defaultMaxPrice={maxPrice}
            />
          </Suspense>
        </div>
        <div className="lg:col-span-5">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense>
              <ProductLists
                minPrice={minPrice}
                maxPrice={maxPrice}
                stock={stock}
                q={q}
                sort={sort}
              />
            </Suspense>
          </HydrationBoundary>
        </div>
      </div>
    </div>
  );
}
