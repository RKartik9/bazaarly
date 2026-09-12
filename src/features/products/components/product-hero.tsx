"use client";

import Link from "next/link";
import { ShieldCheck, RotateCcw, Truck } from "lucide-react";
import { RatingStars } from "@/components/ui/rating-stars";
import type { ProductDetailDto } from "@/features/catalog/types";
import { siteConfig } from "@/lib/site";
import { useVariantSelection } from "../use-variant-selection";
import { BuyBox } from "./buy-box";
import { ProductGallery } from "./product-gallery";

const assurances = [
  { icon: Truck, label: `Free delivery over ₹${siteConfig.freeShippingThreshold}` },
  { icon: RotateCcw, label: "7-day easy returns" },
  { icon: ShieldCheck, label: "1 year warranty" },
];

export function ProductHero({ product }: { product: ProductDetailDto }) {
  const { selection, selected, optionsFor, select } = useVariantSelection(product);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <ProductGallery images={product.images} title={product.title} activeImage={selected?.image || undefined} />
      </div>

      <div className="space-y-6">
        <div>
          <Link href={`/search?brand=${encodeURIComponent(product.brand)}`} className="text-sm font-semibold uppercase tracking-widest text-secondary hover:underline">
            {product.brand}
          </Link>
          <h1 className="mt-1 font-heading text-3xl font-extrabold leading-tight sm:text-4xl">{product.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <a href="#reviews" className="inline-flex items-center gap-2 hover:underline">
              <RatingStars value={product.rating.avg} count={product.rating.count} size="md" />
            </a>
            {product.soldCount > 50 && (
              <span className="text-muted-foreground">{product.soldCount.toLocaleString("en-IN")}+ bought recently</span>
            )}
          </div>
        </div>

        <BuyBox product={product} selected={selected} selection={selection} optionsFor={optionsFor} onSelect={select} />

        <ul className="grid grid-cols-3 gap-2">
          {assurances.map(({ icon: Icon, label }) => (
            <li key={label} className="flex flex-col items-center gap-1.5 rounded-2xl bg-muted/60 px-2 py-3 text-center text-xs font-medium">
              <Icon className="size-5 text-teal" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
