"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { ProductCardDto } from "@/features/catalog/types";
import { ProductCard } from "@/features/products/components/product-card";
import { useWishlist } from "../wishlist-provider";

export function WishlistGrid({ products }: { products: ProductCardDto[] }) {
  const { ids } = useWishlist();
  const visible = products.filter((p) => ids.has(p.id));

  if (!visible.length) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed bg-card/60 px-6 py-20 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-blush text-primary">
          <Heart className="size-8" />
        </div>
        <h2 className="mt-5 font-heading text-2xl font-bold">Your wishlist is empty</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">Tap the heart on any product to save it here for later.</p>
        <Button asChild className="mt-6 rounded-full" size="lg">
          <Link href="/search">Start exploring</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence>
        {visible.map((p) => (
          <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <ProductCard product={p} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
