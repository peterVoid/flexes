"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export function SortingProducts() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleClick = (
    value: "lowest_price" | "higher_price" | "best" = "best",
  ) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("sort", value);
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        className="bg-white"
        variant="reverse"
        onClick={() => handleClick("lowest_price")}
      >
        Lowest Price
      </Button>
      <Button
        className="bg-white"
        variant="reverse"
        onClick={() => handleClick("higher_price")}
      >
        Higher Price
      </Button>
      <Button
        className="bg-white"
        variant="reverse"
        onClick={() => handleClick("best")}
      >
        Best Sellers
      </Button>
    </div>
  );
}
