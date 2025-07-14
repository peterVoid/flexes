import { ProductDetails } from "@/features/products/components/product-details";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

interface Props {
  params: Promise<{ productId: string }>;
}

export default async function Home({ params }: Props) {
  const { productId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getOne.queryOptions({
      productId,
    }),
  );

  return (
    <div className="px-12 py-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense>
          <ProductDetails productId={productId} />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
