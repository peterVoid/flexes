import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { formatAsRupiah } from "@/lib/utils";
import { Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "../types";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const router = useRouter();

  const trpc = useTRPC();
  const { data: isProductInCart } = useQuery(
    trpc.cart.isProductInCart.queryOptions({
      productId: product.id,
    }),
  );

  if (isProductInCart === undefined) return null;

  return (
    <div onClick={() => router.push(`/product/${product.id}`)}>
      <Card className="w-full cursor-pointer rounded-lg border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="p-3 pb-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-base font-bold">
                {product.name}
              </CardTitle>
              <div className="truncate text-xs text-gray-600">
                @{product.category.name}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-full border border-black bg-yellow-100 px-2 py-1">
              <Star className="h-3 w-3 fill-yellow-500 stroke-yellow-600" />
              <span className="text-xs font-medium">
                {!!product.reviews.length
                  ? (
                      product.reviews.reduce(
                        (acc, value) => acc + value.rating,
                        0,
                      ) / product.reviews.length
                    ).toFixed(1)
                  : 0}
                ({product.reviews.length})
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3">
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border-2 border-black bg-gray-100">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
            ) : (
              <div className="p-2 text-center text-sm text-gray-400">
                No image available
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between p-3 pt-0">
          <span className="text-lg font-bold">
            {formatAsRupiah(product.price, true)}
          </span>
          <AddToCartButton
            userHasProductInCart={isProductInCart}
            productId={product.id}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
