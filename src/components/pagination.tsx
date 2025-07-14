import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";

interface Props {
  hasNextPage: boolean;
  totalPages: number;
  setPage: (page: number) => void;
  page: number;
}

export function Pagination({ hasNextPage, totalPages, setPage, page }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(pageNumber));

    router.push(`${pathname}?${params.toString()}`);
    setPage(pageNumber);
  };

  return (
    <div className="mt-4 flex items-center justify-center gap-x-1">
      {Array.from({ length: totalPages }).map((_, i) => {
        const pageNumber = i + 1;

        return (
          <Button
            key={i}
            size="default"
            className="shrink-0"
            variant={page === pageNumber ? "default" : "reverse"}
            onClick={() => handleClick(pageNumber)}
          >
            {pageNumber}
          </Button>
        );
      })}
    </div>
  );
}
