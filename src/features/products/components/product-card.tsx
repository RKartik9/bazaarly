"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame, Layers } from "lucide-react";
import { RatingStars } from "@/components/ui/rating-stars";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";
import type { ProductCardDto } from "@/features/catalog/types";
import { discountPercent, formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

export function ProductCard({ product, priority = false, className }: { product: ProductCardDto; priority?: boolean; className?: string }) {
  const off = discountPercent(product.price, product.mrp);
  const soldOut = product.totalStock <= 0;

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <Link href={`/p/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
        {product.image && (
          <Image
            src={product.image}
            alt={product.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]",
              product.hoverImage && "group-hover:opacity-0",
              soldOut && "opacity-60 saturate-50",
            )}
          />
        )}
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
          />
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isDeal && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow">
              <Flame className="size-3" /> Deal
            </span>
          )}
          {off >= 30 && !product.isDeal && (
            <span className="rounded-full bg-saffron px-2 py-0.5 text-[11px] font-bold text-saffron-foreground shadow">{off}% off</span>
          )}
          {product.tags.includes("bestseller") && (
            <span className="rounded-full bg-teal px-2 py-0.5 text-[11px] font-bold text-teal-foreground shadow">Bestseller</span>
          )}
        </div>
        {soldOut && (
          <span className="absolute inset-x-3 bottom-3 rounded-full bg-ink/85 py-1.5 text-center text-xs font-semibold text-background">
            Sold out
          </span>
        )}
      </Link>

      <WishlistButton productId={product.id} size="sm" className="absolute right-3 top-3" />

      <div className="mt-3 flex flex-col gap-1 px-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
        <Link href={`/p/${product.slug}`} className="line-clamp-2 text-sm font-medium leading-snug hover:text-primary">
          {product.title}
        </Link>
        <div className="flex items-center justify-between gap-2">
          {product.rating.count > 0 ? (
            <RatingStars value={product.rating.avg} count={product.rating.count} size="xs" />
          ) : (
            <span className="text-[11px] text-muted-foreground">New arrival</span>
          )}
          {product.variantCount > 1 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Layers className="size-3" /> {product.variantCount} options
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="font-heading text-base font-bold">{formatPrice(product.price)}</span>
          {off > 0 && (
            <>
              <span className="strike-price text-xs">{formatPrice(product.mrp)}</span>
              <span className="text-xs font-semibold text-success">{off}% off</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
