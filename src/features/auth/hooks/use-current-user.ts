import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.auth.session.queryOptions());

  if (!data) return null;

  return data;
}
