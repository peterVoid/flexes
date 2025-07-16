"use client";

import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constans";
import { useInterSectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { CartItem } from "./cart-item";
import { ProductCardSummary } from "./product-card-summary";
import { Loader2Icon } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export function CartContent() {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    data: cartData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    trpc.cart.getMany.infiniteQueryOptions(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastItem) => lastItem.nextCursor,
      },
    ),
  );

  const { data: userMainAddress } = useSuspenseQuery(
    trpc.address.getMainAddress.queryOptions(),
  );

  const { mutate: increaseQty, isPending: isIncreasePending } = useMutation(
    trpc.cart.increaseQuantity.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.cart.getMany.infiniteQueryFilter());
      },
      onError: (error) => {
        console.log(error.message);
      },
    }),
  );

  const { mutate: decreaseQty, isPending: isDecreasePending } = useMutation(
    trpc.cart.decreaseQuantity.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.cart.getMany.infiniteQueryFilter());
      },
      onError: (error) => {
        console.log(error.message);
      },
    }),
  );

  const { mutate: removeProduct, isPending: isRemovePending } = useMutation(
    trpc.cart.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.cart.getMany.infiniteQueryFilter());
      },
      onError: (error) => {
        console.log(error.message);
      },
    }),
  );

  const carts = cartData.pages.flatMap((p) => p.carts);

  const totalPrice = carts.reduce(
    (acc, item) => acc + item.quantity * Number(item.product.price),
    0,
  );

  const userHasMainAddress = userMainAddress?.id != null;

  const canUserCheckout =
    carts.every((d) => d.product.stock > 0) && userHasMainAddress;

  const getProductNameOutOfStock = carts
    .filter((d) => d.product.stock === 0)
    .map((d) => d.product.name);

  useInterSectionObserver({
    loadMoreRef,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  return (
    <>
      <div className="lg:col-span-3">
        <div className="flex flex-col gap-y-3">
          {cartData.pages.flatMap((d) => d.carts).length === 0 ? (
            <div className="flex w-full items-center justify-center rounded-md border-2 bg-white p-9">
              <div className="flex flex-col gap-y-3">
                <h2 className={cn("text-2xl font-bold", poppins.className)}>
                  WOAHH, Your cart is empty
                </h2>
                <span className="text-slate-600">
                  Come on, fill the cart with your favorite products.
                </span>
                <Button className="w-fit" variant="reverse" asChild>
                  <Link href="/">Go Shopping</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {cartData.pages
                .flatMap((d) => d.carts)
                .map((cart) => (
                  <CartItem
                    key={cart.id}
                    cart={cart}
                    onDecrease={() =>
                      decreaseQty({ productId: cart.product.id })
                    }
                    onIncrease={() =>
                      increaseQty({ productId: cart.product.id })
                    }
                    onRemove={() =>
                      removeProduct({ productId: cart.product.id })
                    }
                    isLoading={
                      isIncreasePending || isDecreasePending || isRemovePending
                    }
                  />
                ))}

              {hasNextPage && isFetchingNextPage && (
                <Loader2Icon className="mx-auto animate-spin" />
              )}
              {hasNextPage && <div ref={loadMoreRef} className="h-10" />}
            </>
          )}
        </div>
      </div>
      <div className="lg:col-span-2">
        <ProductCardSummary
          nameOfProductOutOfStock={getProductNameOutOfStock}
          canUserCheckout={canUserCheckout}
          userHasMainAddress={userHasMainAddress}
          onCheckout={() => router.push("/cart/checkout")}
          total={totalPrice}
          isLoading={
            isIncreasePending ||
            isDecreasePending ||
            isRemovePending ||
            isFetchingNextPage
          }
        />
      </div>
    </>
  );
}
