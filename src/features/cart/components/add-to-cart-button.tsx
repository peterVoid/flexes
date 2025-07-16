import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { MouseEvent } from "react";
import { toast } from "sonner";

interface Props {
  userHasProductInCart: boolean;
  productId: string;
  className?: string;
}

export function AddToCartButton({
  userHasProductInCart,
  productId,
  className,
}: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { redirectToSignIn, user } = useClerk();

  const { mutate: addToCart, isPending: isAddToCartPending } = useMutation(
    trpc.cart.addToCart.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.cart.isProductInCart.queryFilter());
        toast.success("Product successfully added to cart");
      },
      onError: (error) => {
        console.error(error.message);
        toast.error("Something went wrong");
      },
    }),
  );

  const { mutate: increaseQty, isPending: isUpdateQtyPending } = useMutation(
    trpc.cart.increaseQuantity.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.cart.isProductInCart.queryFilter());
      },
      onError: (error) => {
        console.error(error.message);
        toast.error("Something went wrong");
      },
    }),
  );

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      redirectToSignIn();
      return;
    }

    if (!userHasProductInCart) {
      addToCart({ productId });
    } else {
      increaseQty({ productId });
    }
  };

  return (
    <Button
      size="sm"
      className={cn(
        "h-8 rounded-md border-2 border-black bg-white px-3 font-medium text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-black hover:text-white active:shadow-none",
        className,
      )}
      disabled={isAddToCartPending || isUpdateQtyPending}
      onClick={handleClick}
    >
      {isAddToCartPending || isUpdateQtyPending ? (
        <>
          <Loader2Icon className="mx-auto animate-spin" />
          Add to cart
        </>
      ) : (
        <>Add to cart</>
      )}
    </Button>
  );
}
