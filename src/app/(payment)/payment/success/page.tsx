import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <CheckIcon className="size-56 text-green-400" />
      <h1 className="text-4xl font-bold">
        Thank you for purchasing our products🤗
      </h1>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
