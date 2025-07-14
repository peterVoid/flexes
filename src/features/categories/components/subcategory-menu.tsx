import Link from "next/link";
import { Category } from "../types";

interface Props {
  category: Category;
}

export function SubcategoryMenu({ category }: Props) {
  if (!category.subcategories || category.subcategories.length === 0) return;

  const backgroundColor = category.color ?? "white";

  return (
    <div
      className="absolute z-50 w-60 rounded-lg border px-4 py-3"
      style={{
        backgroundColor,
      }}
    >
      <div className="flex flex-col">
        {category.subcategories.map((subcategory) => (
          <div
            key={subcategory.name}
            className="cursor-pointer rounded-md px-2 py-3 transition-all hover:bg-black hover:text-white hover:underline"
          >
            <Link href={`/${category.slug}/${subcategory.slug}`}>
              <span className="text-lg font-semibold">{subcategory.name}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
