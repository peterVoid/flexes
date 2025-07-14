import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SubcategoryMenu } from "./subcategory-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Category } from "../types";

interface Props {
  category: Category;
  isAnyHovered?: boolean;
  currentActiveCategory: string;
}

export function CategoryDropdownButton({
  category,
  isAnyHovered,
  currentActiveCategory,
}: Props) {
  const [openSubcategoryMenu, setOpenSubcategoryMenu] = useState(false);

  const handleMouseEnter = () => {
    setOpenSubcategoryMenu(true);
  };

  const handleMouseLeave = () => {
    setOpenSubcategoryMenu(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        variant="reverse"
        className={cn(
          "hover:border-border cursor-pointer rounded-full border border-transparent bg-transparent text-base hover:bg-green-400",
          openSubcategoryMenu && "border-border bg-green-400",
          category.slug === currentActiveCategory &&
            !isAnyHovered &&
            "border-border bg-white",
        )}
        asChild
      >
        <Link href={`/${category.slug}`} className="text-lg font-semibold">
          {category.name}
        </Link>
      </Button>

      <div className="h-1" />

      {openSubcategoryMenu && <SubcategoryMenu category={category} />}
    </div>
  );
}
