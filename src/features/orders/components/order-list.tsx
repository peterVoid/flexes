"use client";

import { DEFAULT_LIMIT } from "@/constans";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { MapPinIcon } from "lucide-react";
import { Order } from "../types";
import { IoBagCheck } from "react-icons/io5";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { formatAsRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DialogButton } from "@/components/dialog-button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ReviewForm } from "@/features/reviews/components/review-form";

export function OrderList() {
  const trpc = useTRPC();
  const { data } = useSuspenseInfiniteQuery(
    trpc.orders.getMany.infiniteQueryOptions(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastItem) => lastItem.nextCursor,
      },
    ),
  );

  const orders = data.pages.flatMap((d) => d.myOrders);

  return (
    <>
      <div className="px-7">
        {orders?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-black bg-white py-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <MapPinIcon className="mb-4 h-10 w-10 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">No addresses saved</h3>
            <p className="mb-4 text-sm text-gray-600">
              Add your first address to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

interface OrderCardProps {
  order: Order;
}

function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();

  const [openReviewModal, setOpenReviewModal] = useState(false);

  const trpc = useTRPC();
  const { mutate } = useMutation(
    trpc.cart.increaseQuantity.mutationOptions({
      onSuccess: () => {
        router.push("/cart");
      },
      onError: () => {
        toast.success("Product not found");
        router.push("/");
      },
    }),
  );

  const totalOrder =
    order.quantity * order.product.price + order.shippingAmount;

  const totalShoppingAmount = order.shippingAmount + order.product.price;

  const infoShipping = [
    {
      label: "Courier",
      value: order.courier,
    },
    {
      label: "Order Id",
      value: order.order_id,
    },
    {
      label: "Address",
      value: order.address.complete_address,
    },
  ];

  const paymentDetails = [
    {
      label: "Payment Method",
      value: order.payment_type,
    },
    {
      label: "Product Price",
      value: formatAsRupiah(order.product.price, true),
    },
    {
      label: "Shipping Amount",
      value: formatAsRupiah(order.shippingAmount ?? 0, true),
    },
    {
      label: "Total Shopping Amount",
      value: formatAsRupiah(totalShoppingAmount, true),
    },
  ];

  return (
    <div className="space-y-4 rounded-md border-2 px-3 py-4">
      <div className="flex items-center gap-3">
        <IoBagCheck />
        <span className="text-sm font-bold">Shopping</span>
        <span className="text-sm">18 Apr 2025</span>
        <Badge>{order.status}</Badge>
        <span className="text-sm text-slate-600">{order.id}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Image
            src={order.product.imageUrl ?? "/placeholder.png"}
            alt={order.product.name}
            width={50}
            height={50}
            className="size-20 object-cover"
          />
          <div>
            <div className="font-bold">{order.product.name}</div>
            <div className="text-sm text-slate-600">
              {order.quantity} quantity x{" "}
              {formatAsRupiah(order.product.price, true)}
            </div>
          </div>
        </div>
        <div className="pr-7 text-center">
          <div className="text-sm text-slate-600">Total belaja</div>
          <div className="font-bold">{formatAsRupiah(totalOrder, true)}</div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pr-4">
        <Button className="bg-white" onClick={() => setOpenReviewModal(true)}>
          Leave it Reviews
        </Button>
        <OrderDetailsButton
          infoShipping={infoShipping}
          paymentDetails={paymentDetails}
        />
        <Button
          variant="reverse"
          onClick={() => mutate({ productId: order.productId })}
        >
          Buy again
        </Button>
      </div>

      <DialogButton
        open={openReviewModal}
        onOpenChange={setOpenReviewModal}
        title="Leave reviews"
      >
        <ReviewForm
          productId={order.product.id}
          initialValue={order.product.reviews}
        />
      </DialogButton>
    </div>
  );
}

interface OrderDetailsButtonProps {
  infoShipping: { label: string; value: string }[];
  paymentDetails: { label: string; value: string | null }[];
}

function OrderDetailsButton({
  infoShipping,
  paymentDetails,
}: OrderDetailsButtonProps) {
  const [openDetails, setOpenDetails] = useState(false);

  return (
    <>
      <Button
        variant="noShadow"
        className="bg-white"
        onClick={() => setOpenDetails(true)}
      >
        View Details
      </Button>
      <DialogButton
        open={openDetails}
        onOpenChange={setOpenDetails}
        title="View Details"
      >
        <div className="space-y-3">
          <div className="rounded-md border-2 bg-white px-4 py-3">
            <h1 className="font-semibold">Info Pengiriman</h1>
            <div className="mt-3 flex flex-col gap-y-2">
              {infoShipping.map((sd) => (
                <div
                  key={sd.label}
                  className="grid grid-cols-[50px_10px_auto] items-center gap-x-4"
                >
                  <div className="flex flex-1 items-center justify-between">
                    <div className="text-sm text-slate-600">{sd.label}</div>
                  </div>
                  <div>:</div>
                  <div className="line-clamp-4 text-sm">{sd.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border-2 bg-white px-4 py-3">
            <h1 className="font-semibold">Payment Details</h1>
            <div className="mt-3 flex flex-col gap-y-2">
              {paymentDetails.map((pd) => (
                <div
                  key={pd.label}
                  className="grid grid-cols-[100px_10px_auto] items-center gap-x-4"
                >
                  <div className="flex flex-1 items-center justify-between">
                    <div className="text-sm text-slate-600">{pd.label}</div>
                  </div>
                  <div>:</div>
                  <div className="line-clamp-4 text-sm">{pd.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogButton>
    </>
  );
}
