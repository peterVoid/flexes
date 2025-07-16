import { DEFAULT_LIMIT } from "@/constans";
import { CheckoutContent } from "@/features/checkout/components/checkout-content";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function Page() {
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.cart.getMany.infiniteQueryOptions(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastItem) => lastItem.nextCursor,
      },
    ),
  );

  void queryClient.prefetchQuery(trpc.address.getMainAddress.queryOptions());

  return (
    <div className="mx-auto max-w-(--breakpoint-xl) py-9">
      <h1 className="text-4xl font-semibold">Checkout</h1>
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense>
            <CheckoutContent />
          </Suspense>
        </HydrationBoundary>
      </div>
    </div>
  );
}
