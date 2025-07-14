"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function FilterByParent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const onSelect = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("ct", value);

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Select by category type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="parent-category">Parent categories</SelectItem>
        <SelectItem value="children-category">Subcategories</SelectItem>
      </SelectContent>
    </Select>
  );
}
