import { DEFAULT_PAGE_SIZE } from "@/constans";
import { AddCategoryButton } from "@/features/categories/components/add-category-button";
import { CategoriesTableComp } from "@/features/categories/components/categories-table";
import { FilterByParent } from "@/features/categories/components/filter-by-parent";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{ page?: number; ct?: string }>;
}

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: Props) {
  const { page, ct } = await searchParams;

  const currentPage = page ? Number(page) : 1;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.categories.getMany.queryOptions({
      pageSize: DEFAULT_PAGE_SIZE,
      page: currentPage,
      ct,
    }),
  );

  return (
    <div className="w-full py-3">
      <div className="flex flex-col gap-y-11">
        <h1 className="text-5xl font-bold">Categories</h1>
        <div className="flex flex-1 items-center justify-between">
          <Suspense>
            <FilterByParent />
          </Suspense>
          <AddCategoryButton />
        </div>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense>
            <CategoriesTableComp currentPage={currentPage} ct={ct} />
          </Suspense>
        </HydrationBoundary>
      </div>
    </div>
  );
}
