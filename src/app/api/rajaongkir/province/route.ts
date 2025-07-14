import { getProvinces } from "@/lib/raja-ongkir";
import { NextResponse } from "next/server";

export async function GET() {
  const provinces = await getProvinces();

  return NextResponse.json(provinces);
}
