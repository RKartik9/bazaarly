import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Crumbs } from "@/features/catalog/components/crumbs";
import { getProductsByIds } from "@/features/catalog/queries";
import { WishlistGrid } from "@/features/wishlist/components/wishlist-grid";
import { getWishlistIds } from "@/features/wishlist/queries";
import { getSessionUser } from "@/lib/auth/current-user";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const user = await getSessionUser();
  const ids = user ? await getWishlistIds() : [];
  const products = await getProductsByIds(ids);

  return (
    <div className="container-x space-y-6 py-6 sm:py-8">
      <div>
        <Crumbs items={[{ label: "Wishlist" }]} />
        <h1 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">Wishlist</h1>
        {user && <p className="mt-1 text-sm text-muted-foreground">{products.length} saved {products.length === 1 ? "item" : "items"}</p>}
      </div>

      {user ? (
        <WishlistGrid products={products} />
      ) : (
        <div className="flex flex-col items-center rounded-3xl bg-lavender/60 px-6 py-20 text-center">
          <h2 className="font-heading text-2xl font-bold">Sign in to see your wishlist</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Your saved items follow you across devices once you sign in.</p>
          <Button asChild className="mt-6 rounded-full" size="lg">
            <Link href="/sign-in?redirect_url=/wishlist">Sign in</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
