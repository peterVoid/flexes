"use client";

import { cn } from "@/lib/utils";
import { ChartColumnIncreasing, Folder, Laptop } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoPeopleCircleOutline } from "react-icons/io5";
import { MdPayment } from "react-icons/md";

interface Props {
  sidebarState: "expanded" | "collapsed";
}

const SIDEBAR_LINKS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: ChartColumnIncreasing,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: IoPeopleCircleOutline,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Folder,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Laptop,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: MdPayment,
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
            sidebarState === "collapsed" ? "justify-center p-1.5" : "px-3 py-2",
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
