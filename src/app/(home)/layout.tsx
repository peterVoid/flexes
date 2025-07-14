import { ListCategories } from "@/features/categories/components/list-categories";
import { Footer } from "@/features/home/components/footer";
import { Navbar } from "@/features/home/components/navbar";
import { SearchInput } from "@/features/home/components/search-input";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.categories.getManyPublic.queryOptions());

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-col gap-y-3 border-b-2 bg-[#F4F4F0]">
        <SearchInput />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense>
            <ListCategories />
          </Suspense>
        </HydrationBoundary>
      </div>
      <div className="mt-2 flex-1 bg-[#F4F4F0]">{children}</div>
      <Footer />
    </div>
  );
}
