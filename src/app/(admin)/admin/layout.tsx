import { AdminLayout } from "@/features/admin/components/admin-layout";
import { getQueryClient, trpc } from "@/trpc/server";

interface Props {
  children: React.ReactNode;
}

export default async function Layout({ children }: Props) {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.auth.session.queryOptions());

  return <AdminLayout>{children}</AdminLayout>;
}
