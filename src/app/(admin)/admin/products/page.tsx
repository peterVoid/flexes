import { DEFAULT_PAGE_SIZE } from "@/constans";
import { AddProductButton } from "@/features/products/components/add-product-button";
import { FilterByInputName } from "@/components/filter-by-input-name";
import { ProductsTable } from "@/features/products/components/products-table";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{ page?: number; q?: string }>;
}

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: Props) {
  const { page, q } = await searchParams;

  const currentPage = page ? Number(page) : 1;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getManyAdmin.queryOptions({
      pageSize: DEFAULT_PAGE_SIZE,
      page: currentPage,
      q,
    }),
  );

  return (
    <div className="w-full py-3">
      <div className="flex flex-col gap-y-11">
        <h1 className="text-5xl font-bold">Products</h1>
        <div className="flex flex-1 items-center justify-between">
          <Suspense>
            <FilterByInputName />
          </Suspense>
          <AddProductButton />
        </div>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense>
            <ProductsTable currentPage={currentPage} q={q} />
          </Suspense>
        </HydrationBoundary>
      </div>
    </div>
  );
}
