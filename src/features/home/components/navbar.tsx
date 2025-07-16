"use client";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@/features/auth/components/sign-in-button";
import { SignUpButton } from "@/features/auth/components/sign-up-button";
import { cn } from "@/lib/utils";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { SettingsIcon, ShoppingBasket } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

const NAV_LINK_PAGES = [
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Features",
    href: "/features",
  },
];

export function Navbar() {
  const trpc = useTRPC();
  const { data: user } = useQuery(trpc.auth.session.queryOptions());

  return (
    <ClerkProvider>
      <nav className="h-20 border-b-2 bg-white">
        <div className="flex h-full items-center justify-between">
          <Link href="/" className="px-4 lg:px-12">
            <span className={cn("text-5xl font-semibold", poppins.className)}>
              flexes
            </span>
          </Link>
          <div className="hidden items-center gap-x-2 lg:flex">
            {NAV_LINK_PAGES.map((item) => (
              <Button
                variant="reverse"
                key={item.title}
                size="lg"
                asChild
                className="rounded-full border-0 bg-white py-6 transition-all hover:border hover:bg-green-400"
              >
                <Link href={item.href}>
                  <span className="text-lg font-medium">{item.title}</span>
                </Link>
              </Button>
            ))}
          </div>

          {!user ? (
            <div className="hidden h-full lg:flex">
              <SignInButton />
              <SignUpButton />
            </div>
          ) : user.role === "user" ? (
            <div className="flex items-center gap-x-3 pr-9">
              <Button
                size="icon"
                variant="noShadow"
                className="bg-white"
                asChild
              >
                <Link href="/cart">
                  <ShoppingBasket />
                </Link>
              </Button>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: {
                      width: "40px",
                      height: "40px",
                    },
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Address"
                    labelIcon={<SettingsIcon className="size-4" />}
                    href="/my-account/address"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          ) : (
            <Button
              variant="noShadow"
              className="flex h-full cursor-pointer items-center justify-center rounded-none border-0 border-t-0 border-r-0 border-b-0 border-l bg-green-400 px-10 py-6 text-center shadow-none transition-all hover:bg-white hover:text-black"
              asChild
            >
              <Link href="/admin">
                <span className="text-lg font-medium">Dashboard</span>
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </ClerkProvider>
  );
}
