import { getCities } from "@/lib/raja-ongkir";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const params = new URL(req.url);
  const provinceId = params.searchParams.get("province_id");

  if (!provinceId) {
    return NextResponse.json({ error: "Missing province id" }, { status: 400 });
  }

  const citites = await getCities(provinceId);

  return NextResponse.json(citites);
}
