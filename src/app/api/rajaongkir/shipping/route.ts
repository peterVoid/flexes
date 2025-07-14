import { getShippingCost } from "@/lib/raja-ongkir";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { origin, destination, weight, courier } = await req.json();

  try {
    const results = await getShippingCost(origin, destination, weight, courier);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      {
        error: "Failed to calculate shipping cost",
      },
      {
        status: 500,
      },
    );
  }
}
