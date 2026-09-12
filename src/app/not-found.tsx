import Link from "next/link";
import { Compass, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorefrontShell } from "@/components/layout/storefront-shell";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <StorefrontShell>
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <p className="font-heading text-8xl font-extrabold tracking-tight text-blush">404</p>
        <h1 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">We couldn&apos;t find that page</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">The link may be broken or the product may have been removed. Let&apos;s get you back to shopping.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link href="/">
              <Compass className="size-4" /> Go home
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/search">
              <Search className="size-4" /> Search products
            </Link>
          </Button>
        </div>
      </div>
    </StorefrontShell>
  );
}
