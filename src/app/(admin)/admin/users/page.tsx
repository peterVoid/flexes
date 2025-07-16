import { DEFAULT_PAGE_SIZE } from "@/constans";
import { UsersTable } from "@/features/users/components/users-table";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { FilterByInputName } from "@/components/filter-by-input-name";

interface Props {
  searchParams: Promise<{ page?: number; q?: string }>;
}

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: Props) {
  const { page, q } = await searchParams;

  const currentPage = page ? Number(page) : 1;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.users.getMany.queryOptions({
      pageSize: DEFAULT_PAGE_SIZE,
      page: currentPage,
      q,
    }),
  );

  return (
    <div className="w-full py-3">
      <div className="flex flex-col gap-y-11">
        <h1 className="text-5xl font-bold">Users</h1>
        <div className="flex flex-1">
          <Suspense>
            <FilterByInputName />
          </Suspense>
        </div>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense>
            <UsersTable currentPage={currentPage} q={q} />
          </Suspense>
        </HydrationBoundary>
      </div>
    </div>
  );
}
