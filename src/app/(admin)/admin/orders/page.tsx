import { DEFAULT_PAGE_SIZE } from "@/constans";
import { OrdersTable } from "@/features/orders/components/orders-table";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{ page?: number }>;
}

export default async function Page({ searchParams }: Props) {
  const { page } = await searchParams;

  const currentPage = page ? Number(page) : 1;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.orders.getManyAdmin.queryOptions({
      pageSize: DEFAULT_PAGE_SIZE,
      page: currentPage,
    }),
  );

  return (
    <div className="w-full py-3">
      <div className="flex flex-col gap-y-11">
        <h1 className="text-5xl font-bold">Orders</h1>
        <div className="flex flex-1"></div>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense>
            <OrdersTable currentPage={currentPage} />
          </Suspense>
        </HydrationBoundary>
      </div>
    </div>
  );
}
