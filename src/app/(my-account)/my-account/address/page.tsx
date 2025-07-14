import { AddAddressButton } from "@/features/address/components/add-address-button";
import { AddressList } from "@/features/address/components/address-list";
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
  void queryClient.prefetchQuery(trpc.address.getMany.queryOptions());

  return (
    <div className="w-full py-3">
      <div className="flex flex-col gap-y-11">
        <div className="mt-14 lg:pl-7">
          <div className="flex items-center justify-between">
            <h1 className={cn("text-5xl font-bold", poppins.className)}>
              Address
            </h1>
            <HydrationBoundary state={dehydrate(queryClient)}>
              <Suspense>
                <AddAddressButton />
              </Suspense>
            </HydrationBoundary>
          </div>
          <div className="my-20">
            <HydrationBoundary state={dehydrate(queryClient)}>
              <Suspense>
                <AddressList />
              </Suspense>
            </HydrationBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
