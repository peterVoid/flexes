import Image from "next/image";
import { Cart } from "../types";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatAsRupiah } from "@/lib/utils";

interface Props {
  cart: Cart;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  isLoading: boolean;
}

export function CartItem({
  cart,
  onIncrease,
  onDecrease,
  onRemove,
  isLoading,
}: Props) {
  return (
    <div className="overflow-hidden rounded-md border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex gap-x-4 p-3">
        <div className="relative h-24 w-24 flex-shrink-0 border-2 border-black">
          <Image
            src={cart.product.imageUrl ?? "/placeholder.png"}
            alt={cart.product.name}
            fill
            className="object-cover"
            sizes="100px"
          />
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div className="space-y-1">
            <h3 className="line-clamp-1 text-lg font-bold">
              {cart.product.name}
            </h3>
            <p className="text-lg font-bold text-black">
              {formatAsRupiah(cart.product.price, true)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-md bg-white">
              <Button
                variant="noShadow"
                size="sm"
                onClick={onDecrease}
                className="h-8 w-8 rounded-none p-0 hover:bg-gray-100"
                disabled={cart.quantity <= 1 || isLoading}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-2 font-medium">{cart.quantity}</span>
              <Button
                variant="noShadow"
                size="sm"
                onClick={onIncrease}
                className="h-8 w-8 rounded-none p-0 hover:bg-gray-100"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="reverse"
              size="sm"
              onClick={onRemove}
              className="h-8 rounded-md border-2 border-black bg-red-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-200 active:shadow-none"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
