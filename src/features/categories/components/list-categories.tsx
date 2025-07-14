"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpWideNarrow } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CategoriesSidebar } from "./categories-sidebar";
import { CategoryDropdownButton } from "./category-dropdown-button";

export function ListCategories() {
  const params = useParams();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewAllRef = useRef<HTMLButtonElement | null>(null);
  const allCategoriesWidth = useRef<HTMLDivElement | null>(null);

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.categories.getManyPublic.queryOptions(),
  );

  const [visibleCategories, setVisibleCategories] = useState(data.length);
  const [openCategoriesSidebar, setOpenCategoriesSidebar] = useState(false);
  const [isAnyHovered, setIsAnyHovered] = useState(false);

  useEffect(() => {
    const calculateCategoriesWidth = () => {
      if (
        !containerRef.current ||
        !viewAllRef.current ||
        !allCategoriesWidth.current
      )
        return;

      const containerWidth = containerRef.current.offsetWidth;
      const viewAllWidth = viewAllRef.current.offsetWidth;
      const availableWidth = containerWidth - viewAllWidth;

      const categoriesItems = Array.from(allCategoriesWidth.current.children);

      let totalWidth = 0;
      let totalItems = 0;

      for (const item of categoriesItems) {
        const categoryWidth = item.getBoundingClientRect().width;

        if (totalWidth + categoryWidth >= availableWidth) break;

        totalWidth += categoryWidth;
        totalItems++;
      }

      setVisibleCategories(totalItems);
    };

    const resize = new ResizeObserver(calculateCategoriesWidth);
    resize.observe(containerRef.current!);

    return () => resize.disconnect();
  }, []);

  const currentActiveCategory = params.category ?? "all";

  return (
    <div
      className="px-4 pb-6 lg:px-14"
      onMouseEnter={() => {
        setIsAnyHovered(true);
      }}
      onMouseLeave={() => {
        setIsAnyHovered(false);
      }}
    >
      <div
        ref={allCategoriesWidth}
        className="flex items-center"
        style={{
          position: "fixed",
          top: 2000000,
          left: 88888202020,
        }}
      >
        {data.map((category) => (
          <CategoryDropdownButton
            key={category.slug}
            category={category}
            currentActiveCategory={currentActiveCategory as string}
          />
        ))}
      </div>

      <div ref={containerRef} className="flex items-center">
        <Button
          variant="reverse"
          className={cn(
            "hover:border-border cursor-pointer rounded-full border border-transparent bg-transparent text-base hover:bg-green-400",
            currentActiveCategory === "all" &&
              !isAnyHovered &&
              "border-border bg-white",
          )}
          asChild
        >
          <Link href="/" className="text-lg font-semibold">
            All
          </Link>
        </Button>
        {data.slice(0, visibleCategories).map((category) => (
          <CategoryDropdownButton
            key={category.slug}
            category={category}
            isAnyHovered={isAnyHovered}
            currentActiveCategory={currentActiveCategory as string}
          />
        ))}
        <Button
          ref={viewAllRef}
          variant="reverse"
          className="-mt-1 cursor-pointer rounded-full border-0 bg-transparent text-base hover:border hover:bg-green-400"
          onClick={() => setOpenCategoriesSidebar(true)}
        >
          View all
          <ArrowUpWideNarrow />
        </Button>
      </div>

      <CategoriesSidebar
        open={openCategoriesSidebar}
        onOpenChange={setOpenCategoriesSidebar}
      />
    </div>
  );
}
