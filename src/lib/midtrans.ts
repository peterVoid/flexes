// @ts-ignore
import { env } from "@/env/server";
import Midtrans from "midtrans-client";

export const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: env.MIDTRANS_SERVER_KEY,
});
