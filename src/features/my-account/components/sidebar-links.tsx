"use client";

import { cn } from "@/lib/utils";
import { MapPinMinusInside } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdProductionQuantityLimits } from "react-icons/md";

interface Props {
  sidebarState: "expanded" | "collapsed";
}

const SIDEBAR_LINKS = [
  {
    label: "Address",
    href: "/my-account/address",
    icon: MapPinMinusInside,
  },
  {
    label: "Transaction List",
    href: "/my-account/order-list",
    icon: MdProductionQuantityLimits,
  },
];

export function SidebarLinks({ sidebarState }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-y-3">
      {SIDEBAR_LINKS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "hover:bg-main flex items-center gap-x-2 rounded-md transition",
            pathname === item.href && "bg-main border-2 border-black",
            sidebarState === "collapsed"
              ? "justify-center py-1.5"
              : "px-3 py-2",
          )}
        >
          {sidebarState === "expanded" ? (
            <>
              {<item.icon className="size-5" />}
              {item.label}
            </>
          ) : (
            <item.icon className="size-5 ring-offset-black" />
          )}
        </Link>
      ))}
    </div>
  );
}
