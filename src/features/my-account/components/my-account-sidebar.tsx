"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { SidebarLinks } from "./sidebar-links";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["800"],
});

export function MyAccountSidebar() {
  const { state } = useSidebar();

  return (
    <Sidebar className="text-black" variant="sidebar" collapsible="icon">
      <SidebarHeader className="flex flex-row items-center justify-center">
        {state !== "collapsed" && (
          <Link href="/">
            <ChevronLeftIcon />
          </Link>
        )}
        <h1
          className={cn(
            "text-2xl font-bold tracking-tighter",
            poppins.className,
          )}
        >
          {state === "collapsed" ? (
            <SettingsIcon className="size-6" />
          ) : (
            <>My Account</>
          )}
        </h1>
      </SidebarHeader>
      <SidebarContent className="p-2 pt-5">
        <SidebarLinks sidebarState={state} />
      </SidebarContent>
    </Sidebar>
  );
}
