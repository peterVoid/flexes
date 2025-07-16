"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./sidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.auth.session.queryOptions());

  if (data?.role !== "admin") {
    redirect("/");
  }

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
