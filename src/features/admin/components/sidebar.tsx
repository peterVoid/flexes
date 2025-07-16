"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { HomeIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import { SidebarLinks } from "./sidebar-links";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["800"],
});

export function AdminSidebar() {
  const { state } = useSidebar();

  return (
    <Sidebar className="text-black" variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <h1
          className={cn(
            "flex items-center justify-center text-2xl font-bold tracking-tighter",
            poppins.className,
          )}
        >
          {state === "collapsed" ? <HomeIcon className="size-6" /> : <>Admin</>}
        </h1>
      </SidebarHeader>
      <SidebarContent className="p-2 pt-5">
        <SidebarLinks sidebarState={state} />
      </SidebarContent>
    </Sidebar>
  );
}
