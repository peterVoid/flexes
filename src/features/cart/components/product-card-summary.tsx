import { Button } from "@/components/ui/button";
import { formatAsRupiah } from "@/lib/utils";

interface ProductCardSummaryProps {
  total: number;
  onCheckout: () => void;
  isLoading: boolean;
  canUserCheckout: boolean;
  nameOfProductOutOfStock: string[];
  userHasMainAddress: boolean;
}

export function ProductCardSummary({
  total,
  onCheckout,
  isLoading,
  canUserCheckout,
  nameOfProductOutOfStock,
  userHasMainAddress,
}: ProductCardSummaryProps) {
  return (
    <div className="sticky top-4 h-fit rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="mb-4 pb-2 text-xl font-bold">ORDER SUMMARY</h2>

      <div className="mb-6 space-y-3">
        <div className="mt-3 flex justify-between border-t-2 border-black pt-3 text-lg font-bold">
          <span>TOTAL:</span>
          <div>
            {isLoading ? (
              <div className="h-2 w-52 animate-pulse rounded bg-gray-400 px-2 py-3" />
            ) : (
              formatAsRupiah(total, true)
            )}
          </div>
        </div>
      </div>

      {!canUserCheckout && (
        <p className="text-center font-semibold text-red-500">
          {nameOfProductOutOfStock.length > 0 &&
            `${nameOfProductOutOfStock.join(", ")} out of stock`}

          {!userHasMainAddress && "User has not set any address yet"}
        </p>
      )}
      <Button
        onClick={onCheckout}
        className="w-full rounded-md border-2 border-black bg-white py-3 font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-black hover:text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        disabled={!canUserCheckout}
      >
        PROCEED TO CHECKOUT
      </Button>
    </div>
  );
}
