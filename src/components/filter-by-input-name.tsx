"use client";

import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function FilterByInputName() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [value, setValue] = useState("");

  useEffect(() => {
    const timeId = setTimeout(() => {
      const handleChange = () => {
        const params = new URLSearchParams(searchParams);

        if (value) {
          params.set("q", value);
        } else {
          params.delete("q");
        }

        router.push(`?${params.toString()}`);
      };

      handleChange();
    }, 1000);

    return () => clearTimeout(timeId);
  }, [router, searchParams, value]);

  return (
    <div className="">
      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-2 size-5 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Search by name"
          className="h-12 pr-8 pl-9 text-base font-semibold"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    </div>
  );
}
