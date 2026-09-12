"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { error: Error & { digest?: string }; reset: () => void; homeHref?: string; homeLabel?: string };

export function ErrorView({ error, reset, homeHref = "/", homeLabel = "Back to home" }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-heading text-7xl font-extrabold text-blush">Oops</p>
      <h1 className="mt-2 font-heading text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We hit an unexpected snag. Trying again usually fixes it.
        {error.digest && <span className="mt-1 block font-mono text-xs">Ref: {error.digest}</span>}
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset} className="rounded-full">
          <RefreshCw className="size-4" /> Try again
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
