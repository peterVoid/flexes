import { RefObject, useEffect } from "react";

interface Props {
  loadMoreRef: RefObject<HTMLDivElement | null>;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export function useInterSectionObserver({
  loadMoreRef,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: Props) {
  useEffect(() => {
    const loadMoreNode = loadMoreRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "100px",
      },
    );

    if (loadMoreNode) {
      observer.observe(loadMoreNode);
    }

    return () => {
      if (loadMoreNode) {
        observer.unobserve(loadMoreNode);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, loadMoreRef]);
}
