"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export function SortingProducts() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleClick = (value: "latest" | "oldest" | "best" = "latest") => {
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
        onClick={() => handleClick("latest")}
      >
        Latest
      </Button>
      <Button
        className="bg-white"
        variant="reverse"
        onClick={() => handleClick("oldest")}
      >
        Oldest
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
