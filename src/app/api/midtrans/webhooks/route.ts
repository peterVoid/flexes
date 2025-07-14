import { db } from "@/db";
import { OrdersTable, ProductsTable } from "@/db/schema";
import { snap } from "@/lib/midtrans";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const midtransData = await snap.transaction.notification(body);

    const transactionStatus = midtransData.transaction_status;

    if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      return NextResponse.json({ message: "Failure" }, { status: 200 });
    } else if (transactionStatus === "pending") {
      return NextResponse.json({ message: "Waiting Payment" }, { status: 200 });
    }

    await db
      .update(OrdersTable)
      .set({
        currency: midtransData.currency,
        hasPaid: true,
        payment_type: midtransData.payment_type,
        settlement_time: new Date(),
        status: "paid",
      })
      .where(eq(OrdersTable.order_id, midtransData.order_id))
      .returning();

    const getProducts = await db
      .select({
        id: ProductsTable.id,
      })
      .from(OrdersTable)
      .where(eq(OrdersTable.order_id, body.order_id))
      .innerJoin(ProductsTable, eq(OrdersTable.productId, ProductsTable.id));

    const updateProducts = await Promise.all(
      getProducts.map(async (p) => {
        const [getProduct] = await db
          .select()
          .from(ProductsTable)
          .where(eq(ProductsTable.id, p.id));

        const newStock = getProduct.stock - 1;

        const soldCount = (getProduct.soldCount ?? 0) + 1;

        if (newStock < 0) {
          return null;
        }

        const [updatedStockProduct] = await db
          .update(ProductsTable)
          .set({
            stock: newStock,
            soldCount,
          })
          .where(eq(ProductsTable.id, p.id))
          .returning();

        return updatedStockProduct;
      }),
    );

    return NextResponse.json({ data: updateProducts }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Invalid notification",
      },
      {
        status: 500,
      },
    );
  }
}
