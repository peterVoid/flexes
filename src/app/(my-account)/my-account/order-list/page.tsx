import { DEFAULT_LIMIT } from "@/constans";
import { OrderList } from "@/features/orders/components/order-list";
import { cn } from "@/lib/utils";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Poppins } from "next/font/google";
import { Suspense } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["800"],
});

export default async function Page() {
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.orders.getMany.infiniteQueryOptions({
      limit: DEFAULT_LIMIT,
    }),
  );

  return (
    <div className="w-full py-3">
      <div className="flex flex-col gap-y-11">
        <div className="mt-14 lg:pl-7">
          <h1 className={cn("text-5xl font-bold", poppins.className)}>
            Transaction
          </h1>
        </div>
        <div className="my-7">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense>
              <OrderList />
            </Suspense>
          </HydrationBoundary>
        </div>
      </div>
    </div>
  );
}
