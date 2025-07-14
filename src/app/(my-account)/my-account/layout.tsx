import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MyAccountSidebar } from "@/features/my-account/components/my-account-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SidebarProvider>
        <div className="flex w-full">
          <div className="max-w-[400px]">
            <MyAccountSidebar />
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
