import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SignInButton() {
  return (
    <Button
      variant="noShadow"
      className="flex h-full cursor-pointer items-center justify-center rounded-none border-0 border-t-0 border-r-0 border-b-0 border-l bg-white px-6 py-6 text-center hover:bg-slate-100"
      asChild
    >
      <Link href="/sign-in">
        <span className="text-lg font-medium">Sign in</span>
      </Link>
    </Button>
  );
}
