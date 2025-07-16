import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatAsRupiah(price: number, pretty: boolean = false) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: pretty ? 0 : 2,
  }).format(price);
}

export const formatAsCurrency = (value: string) => {
  const cleaned = value.replace(/[^0-9,]/g, "");

  const normalized = cleaned.replace(",", ".");

  const toFloat = parseFloat(normalized);

  if (isNaN(toFloat)) {
    return value;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(toFloat);
};

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(date);
}
