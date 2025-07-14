import { db } from "@/db";
import { OrdersTable } from "@/db/schemas/orders";
import { env } from "@/env/client";
import { snap } from "@/lib/midtrans";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const {
    orderId,
    grossAmount,
    items,
    customerDetails,
    courier,
    userAddressId,
  } = await req.json();

  const { sessionClaims } = await auth();

  if (!sessionClaims?.userId) {
    throw new Error("User not found");
  }

  try {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: items,
      customer_details: customerDetails,
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: `${env.NEXT_PUBLIC_APP_URL}/payment/success`,
        unfinish: `${env.NEXT_PUBLIC_APP_URL}/payment/pending`,
        error: `${env.NEXT_PUBLIC_APP_URL}/payment/failed`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    await Promise.all(
      items
        .filter((data: { id: string }) => data.id !== "ONGKIR")
        .map(
          async (data: {
            id: string;
            quantity: string;
            name: string;
            price: string;
            shippingAmount: string;
          }) => {
            const numQty = Number(data.quantity);
            const numShipAmount = Number(data.shippingAmount);

            await db.insert(OrdersTable).values({
              courier,
              user_id: sessionClaims.userId,
              transaction_time: new Date(),
              gross_amount: grossAmount,
              order_id: orderId,
              productId: data.id,
              hasPaid: false,
              quantity: numQty,
              addressId: userAddressId,
              shippingAmount: numShipAmount,
              status: "pending",
            });
          },
        ),
    );

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 },
    );
  }
}
