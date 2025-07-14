import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SignUpButton() {
  return (
    <Button
      variant="noShadow"
      className="flex h-full cursor-pointer items-center justify-center rounded-none border-0 border-t-0 border-r-0 border-b-0 border-l bg-green-400 px-10 py-6 text-center shadow-none transition-all hover:bg-white hover:text-black"
      asChild
    >
      <Link href="/sign-up">
        <span className="text-lg font-medium">Sign up</span>
      </Link>
    </Button>
  );
}
