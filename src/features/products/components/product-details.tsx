"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatAsRupiah } from "@/lib/utils";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";

interface Props {
  productId: string;
}

export function ProductDetails({ productId }: Props) {
  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.products.getOne.queryOptions({ productId }),
  );

  const { data: isProductInCart } = useQuery(
    trpc.cart.isProductInCart.queryOptions({
      productId: product.id,
    }),
  );

  if (isProductInCart === undefined) return null;

  return (
    <div className="relative flex flex-col gap-6 lg:flex-row">
      <div className="lg:sticky lg:top-4 lg:h-fit lg:w-1/2">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 lg:w-1/2">
        <h1 className="text-2xl font-bold">{product.name}</h1>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-full border border-black bg-yellow-100 px-3 py-1">
            <Star className="h-4 w-4 fill-yellow-500 stroke-yellow-600" />
            <span className="text-sm font-medium">
              {product.reviews.length > 0
                ? (
                    product.reviews.reduce((sum, r) => sum + r.rating, 0) /
                    product.reviews.length
                  ).toFixed(1)
                : "0.00"}
              <span className="text-gray-500"> ({product.reviews.length})</span>
            </span>
          </div>

          <div className="text-2xl font-bold">
            {formatAsRupiah(product.price, true)}
          </div>
        </div>

        <div className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
          {product.stock} available
        </div>

        {product.description && (
          <div className="space-y-2 border-t-2 border-black pt-4">
            <h3 className="font-bold">Description</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>
        )}

        <div className="border-t-2 border-black pt-4">
          <AddToCartButton
            productId={product.id}
            userHasProductInCart={isProductInCart}
            className="w-full py-6 text-lg font-semibold"
          />
        </div>

        <div className="border-t-2 border-black pt-4">
          <h2 className="text-xl font-bold">Customer Reviews</h2>

          {product.reviews.length > 0 ? (
            <div className="mt-4 space-y-4">
              {product.reviews.slice(0, 5).map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border-2 border-black p-4"
                >
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "fill-yellow-500 stroke-yellow-600" : "stroke-gray-300"}`}
                      />
                    ))}
                  </div>
                  {review.description && (
                    <p className="mt-2 text-gray-700">{review.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-gray-500">No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
