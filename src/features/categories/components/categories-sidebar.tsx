import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Category } from "../types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoriesSidebar({ open, onOpenChange }: Props) {
  const router = useRouter();

  const trpc = useTRPC();
  const { data: categoriesData } = useQuery(
    trpc.categories.getManyPublic.queryOptions(),
  );

  const [categoriesShowUp, setCategoriesShowUp] = useState<Category[]>(
    categoriesData ?? [],
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const handleClick = (category: Category) => {
    if (category.subcategories && category.subcategories.length > 0) {
      setCategoriesShowUp(category.subcategories as Category[]);
      setSelectedCategory(category);
    } else if (selectedCategory) {
      router.push(`/${selectedCategory.slug}/${category.slug}`);
    } else if (category.slug === "all") {
      router.push("/");
      onOpenChange(false);
    } else {
      router.push(category.slug);
    }
  };

  const handleBackButton = () => {
    setCategoriesShowUp(categoriesData as Category[]);
    setSelectedCategory(null);
  };

  const backgroundColor = selectedCategory?.color ?? "white";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        style={{
          backgroundColor,
        }}
      >
        <SheetHeader className="border-b">
          <SheetTitle>Categories</SheetTitle>
        </SheetHeader>
        <div className="h-full overflow-y-auto px-2">
          {selectedCategory && (
            <div
              className="mb-3 flex cursor-pointer items-center gap-x-2 px-2 hover:underline"
              onClick={handleBackButton}
            >
              <ChevronLeftIcon className="size-4" /> Back
            </div>
          )}
          {categoriesShowUp.map((category) => (
            <div
              key={category.name}
              className="flex cursor-pointer justify-between rounded-lg px-4 py-3 transition hover:bg-black hover:text-white"
              onClick={() => handleClick(category)}
            >
              {category.name}
              {category.subcategories && category.subcategories.length > 0 && (
                <ChevronRightIcon className="size-6" />
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
