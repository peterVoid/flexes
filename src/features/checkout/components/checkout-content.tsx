"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIMIT } from "@/constans";
import { Cart } from "@/features/cart/types";
import { formatAsRupiah } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CheckoutAddress } from "./checkout-address";

declare global {
  interface Window {
    snap: {
      pay: (token: string) => void;
    };
  }
}

const shippingProviders = [
  {
    name: "JNE",
    image: "/jne.png",
  },
  {
    name: "POS",
    image: "/pos.png",
  },
  {
    name: "TIKI",
    image: "/tiki.png",
  },
];

export function CheckoutContent() {
  const [selectedCourier, setSelectedCourier] = useState("jne");
  const [shippingCost, setShippingCost] = useState(0);
  const [isShippingPending, setIsShippingPending] = useState(false);

  const trpc = useTRPC();
  const { data: cartData } = useSuspenseInfiniteQuery(
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

  const carts = cartData.pages.flatMap((p) => p.carts);

  const totalPrice = carts.reduce(
    (acc, data) => acc + data.quantity * Number(data.product.price),
    0,
  );

  const totalBill = totalPrice + shippingCost;

  const transactionSummaryRows: { name: string; value: string }[] = [
    {
      name: "Total Price",
      value: formatAsRupiah(totalPrice, true),
    },
    {
      name: "Total Shipping Cost",
      value: formatAsRupiah(shippingCost, true),
    },
    {
      name: "Total Bill",
      value: formatAsRupiah(totalBill, true),
    },
  ];

  useEffect(() => {
    const getShippingCost = async () => {
      try {
        setIsShippingPending(true);

        const response = await fetch("/api/rajaongkir/shipping", {
          method: "POST",
          body: JSON.stringify({
            origin: "151",
            destination: userMainAddress?.city_id,
            weight: 200,
            courier: selectedCourier.toLocaleLowerCase(),
          }),
        });

        const data = await response.json();
        setShippingCost(data[0].costs[1].cost[0].value ?? 0);
      } catch {
        console.log("ERROR: GET SHIPPING COST");
      } finally {
        setIsShippingPending(false);
      }
    };

    getShippingCost();
  }, [selectedCourier, userMainAddress]);

  const checkoutItems = carts.map((data) => ({
    id: data.product.id,
    price: data.product.price,
    quantity: data.quantity,
    name: data.product.name,
    shippingAmount: shippingCost,
  }));

  const userHasMainAddress = userMainAddress?.id != null;

  const userCanCheckout =
    carts.every((d) => d.product.stock > 0) && userHasMainAddress;

  return (
    <>
      <div className="lg:col-span-3">
        <div className="flex flex-col gap-y-4">
          <CheckoutAddress address={userMainAddress} />
          <>
            {cartData.pages
              .flatMap((i) => i.carts)
              .map((data, index) => {
                const orderNumber = index + 1;
                return (
                  <CartItem
                    key={data.id}
                    data={data}
                    orderNumber={orderNumber}
                  />
                );
              })}
          </>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="rounded-md border-2 bg-white p-4">
          <CourierSelection
            selectedCourier={selectedCourier}
            setSelectedCourier={setSelectedCourier}
          />
          <TransactionSummary
            transactionSummaryRows={transactionSummaryRows}
            isShippingPending={isShippingPending}
          />
          <div className="mt-3 border-t-3">
            <CheckoutButton
              isShippingPending={isShippingPending}
              grossAmount={totalPrice}
              checkoutItems={checkoutItems}
              selectedCourier={selectedCourier}
              userAddressId={userMainAddress?.id as string}
              userCanCheckout={userCanCheckout}
            />
          </div>
        </div>
      </div>
    </>
  );
}

interface CheckoutButtonProps {
  isShippingPending: boolean;
  grossAmount: number;
  checkoutItems: {
    id: string;
    price: number;
    quantity: number;
    name: string;
    shippingAmount: number;
  }[];
  selectedCourier: string;
  userAddressId: string;
  userCanCheckout: boolean;
}

function CheckoutButton({
  isShippingPending,
  grossAmount,
  checkoutItems,
  selectedCourier,
  userAddressId,
  userCanCheckout,
}: CheckoutButtonProps) {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const { user } = useUser();

  const subTotal = checkoutItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const shippingFee = grossAmount - subTotal;

  const itemDetails = [
    ...checkoutItems,
    ...(shippingFee > 0
      ? [
          {
            id: "ONGKIR",
            name: "Shipping Fee",
            price: shippingFee,
            quantity: 1,
            shippingAmount: 0,
          },
        ]
      : []),
  ];

  const finalGross = itemDetails.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    try {
      const response = await fetch("/api/midtrans", {
        method: "POST",
        body: JSON.stringify({
          orderId: `order-${Date.now()}`,
          grossAmount: finalGross,
          items: itemDetails,
          courier: selectedCourier,
          userAddressId,
          customerDetails: {
            first_name: user?.firstName ?? "",
            last_name: user?.lastName ?? "",
            email: user?.emailAddresses[0].emailAddress ?? "",
            phone: user?.phoneNumbers ?? "",
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      if (window.snap) {
        window.snap.pay(data.token);
      } else {
        window.location.href = data.redirect_url;
      }
    } catch (error) {
      console.error("ERROR: CHECKOUT", error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <Button
      className="mt-3 w-full"
      disabled={isShippingPending || isCheckoutLoading || !userCanCheckout}
      onClick={handleCheckout}
    >
      Checkout
    </Button>
  );
}

interface TransactionSummaryProps {
  transactionSummaryRows: { name: string; value: string }[];
  isShippingPending: boolean;
}

function TransactionSummary({
  transactionSummaryRows,
  isShippingPending,
}: TransactionSummaryProps) {
  return (
    <div className="mt-4">
      <h1 className="text-2xl font-semibold">Check transaction summary</h1>
      {transactionSummaryRows.map((data, i) => (
        <div key={i} className="mt-3 flex items-center justify-between">
          <span>{data.name}</span>
          <span>
            {isShippingPending ? (
              <Skeleton className="h-4 w-[100px] bg-slate-500 sm:w-[200px]" />
            ) : (
              data.value
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

interface CourierSelectionProps {
  selectedCourier: string;
  setSelectedCourier: (courier: string) => void;
}

function CourierSelection({
  selectedCourier,
  setSelectedCourier,
}: CourierSelectionProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Courier</h1>
      <div className="mt-3 flex flex-col gap-y-3">
        {shippingProviders.map((data) => (
          <CourierCard
            key={data.name}
            data={data}
            selectedCourier={selectedCourier}
            setSelectedCourier={setSelectedCourier}
          />
        ))}
      </div>
    </div>
  );
}

function CourierCard({
  data,
  selectedCourier,
  setSelectedCourier,
}: { data: { name: string; image: string } } & CourierSelectionProps) {
  return (
    <div
      className="flex cursor-pointer items-center justify-between border-b-2"
      onClick={() => setSelectedCourier(data.name)}
    >
      <div className="flex items-center gap-x-4">
        <Image
          src={data.image}
          alt={data.name}
          width={50}
          height={50}
          className="size-14 object-cover"
        />
        <h4 className="text-xl">{data.name}</h4>
      </div>
      <Checkbox
        checked={
          selectedCourier.toLowerCase() === data.name.toLowerCase()
            ? true
            : false
        }
      />
    </div>
  );
}

interface CartItemProps {
  data: Cart;
  orderNumber: number;
}

function CartItem({ data, orderNumber }: CartItemProps) {
  return (
    <Card className="mx-auto w-full">
      <CardContent className="px-3">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-normal uppercase">
              Order {orderNumber}
            </h3>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <Image
            src={data.product.imageUrl ?? "/placeholder.png"}
            alt={data.product.name}
            width={100}
            height={100}
            className="h-20 w-20 rounded-lg border object-cover"
          />
          <div className="flex-1">
            <h4 className="mb-2 font-medium">{data.product.name}</h4>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">
              {data.quantity} x {formatAsRupiah(data.product.price, true)}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {/* <div className="border-t pt-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded border">
              <div className="h-2 w-2 rotate-45 transform border-r border-b"></div>
            </div>
            <span className="text-sm font-medium">Kasih Catatan</span>
            <span className="text-muted-foreground ml-auto text-sm">
              {notesCurrentLength}/{notesMaxLength}
            </span>
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
