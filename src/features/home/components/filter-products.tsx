"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn, formatAsCurrency } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface FilterProductsProps {
  defaultMinPrice?: string;
  defaultMaxPrice?: string;
}

export function FilterProducts({
  defaultMaxPrice,
  defaultMinPrice,
}: FilterProductsProps) {
  return (
    <div className="flex flex-col">
      <FilterCard
        title="Filters"
        className="rounded-tl-lg rounded-tr-lg border-t-2 border-r-2 border-l-2"
      />
      <FilterCard title="Price" className="cursor-pointer border-2">
        <FilterByPrice
          defaultMinPrice={defaultMinPrice}
          defaultMaxPrice={defaultMaxPrice}
        />
      </FilterCard>
      <FilterCard
        title="Stock"
        className="cursor-pointer rounded-br-lg rounded-bl-lg border-r-2 border-b-2 border-l-2"
      >
        <FilterByStock />
      </FilterCard>
    </div>
  );
}

export type FilterStock = "in-stock" | "out-of-stock" | "";

function FilterByStock() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedStock, setSelectedStock] = useState<FilterStock>("");

  useEffect(() => {
    const timeId = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (selectedStock !== "") {
        params.set("stock", selectedStock);
      } else {
        params.delete("stock");
      }

      router.push(`?${params.toString()}`);
    }, 1000);

    return () => clearTimeout(timeId);
  }, [router, searchParams, selectedStock]);

  return (
    <div className="mt-3 flex flex-col gap-y-4">
      <div className="flex items-center gap-x-2">
        <Checkbox
          checked={selectedStock === "in-stock"}
          onCheckedChange={() => {
            if (selectedStock === "" || selectedStock === "out-of-stock") {
              setSelectedStock("in-stock");
            } else {
              setSelectedStock("");
            }
          }}
          className="cursor-pointer"
        />
        <p>In stock</p>
      </div>
      <div className="flex items-center gap-x-2">
        <Checkbox
          checked={selectedStock === "out-of-stock"}
          className="cursor-pointer"
          onCheckedChange={() => {
            if (selectedStock === "" || selectedStock === "in-stock") {
              setSelectedStock("out-of-stock");
            } else {
              setSelectedStock("");
            }
          }}
        />
        <p>Out of stock</p>
      </div>
    </div>
  );
}

interface FilterByPriceProps {
  defaultMinPrice?: string;
  defaultMaxPrice?: string;
}

function FilterByPrice({
  defaultMaxPrice,
  defaultMinPrice,
}: FilterByPriceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(defaultMinPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(defaultMaxPrice ?? "");

  useEffect(() => {
    const timId = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (minPrice !== "") {
        params.set("minPrice", minPrice);
      } else {
        params.delete("minPrice");
      }

      if (maxPrice !== "") {
        params.set("maxPrice", maxPrice);
      } else {
        params.delete("maxPrice");
      }

      router.push(`?${params.toString()}`);
    }, 1000);

    return () => clearTimeout(timId);
  }, [minPrice, router, maxPrice, searchParams]);

  return (
    <div className="mt-3 flex flex-col gap-y-4">
      <Input
        type="text"
        placeholder="Min Price"
        value={formatAsCurrency(minPrice) ?? ""}
        onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
      />
      <Input
        type="text"
        placeholder="Max Price"
        value={formatAsCurrency(maxPrice) ?? ""}
        onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
      />
    </div>
  );
}

interface FilterCardProps {
  children?: React.ReactNode;
  title: string;
  className?: string;
}

function FilterCard({ children, title, className }: FilterCardProps) {
  const [openFilters, setOpenFilters] = useState(false);

  return (
    <div className={cn("bg-white px-4 py-5", className)}>
      <div
        className="flex items-center justify-between"
        onClick={() => setOpenFilters((state) => !state)}
      >
        <h5 className="text-lg font-semibold">{title}</h5>
        {children && <ChevronRightIcon />}
      </div>
      {openFilters && children}
    </div>
  );
}
