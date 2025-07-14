import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/features/admin/components/sidebar";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen">
      <SidebarProvider>
        <div className="flex w-full">
          <div className="max-w-[400px]">
            <AdminSidebar />
          </div>
          <div className="flex-1 px-9 pt-4">
            <SidebarTrigger />
            {children}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
