"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Trash2, Undo2 } from "lucide-react";
import { motion } from "motion/react";
import { formatPrice, discountPercent } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { CartLine } from "../types";
import { useCartMutations } from "../use-cart-mutations";
import { QuantityStepper } from "./quantity-stepper";

export function attributeSummary(attributes: Record<string, string>) {
  return Object.entries(attributes)
    .map(([k, v]) => `${k[0]!.toUpperCase()}${k.slice(1)}: ${v}`)
    .join(" · ");
}

export function CartLineItem({ line, compact = false, onNavigate }: { line: CartLine; compact?: boolean; onNavigate?: () => void }) {
  const { updateQty, remove, toggleSaved, pendingSku } = useCartMutations();
  const pending = pendingSku === line.sku;
  const off = discountPercent(line.price, line.mrp);
  const lowStock = line.stock > 0 && line.stock < 5;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, height: 0 }}
      className={cn("flex gap-4", compact ? "py-3" : "py-5")}
    >
      <Link href={`/p/${line.slug}`} onClick={onNavigate} className={cn("relative shrink-0 overflow-hidden rounded-xl bg-muted", compact ? "size-20" : "size-24 sm:size-28")}>
        {line.image && <Image src={line.image} alt={line.title} fill sizes="112px" className="object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{line.brand}</p>
            <Link href={`/p/${line.slug}`} onClick={onNavigate} className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary">
              {line.title}
            </Link>
            {Object.keys(line.attributes).length > 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">{attributeSummary(line.attributes)}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">{formatPrice(line.price * line.qty)}</p>
            {off > 0 && (
              <p className="text-xs">
                <span className="strike-price">{formatPrice(line.mrp * line.qty)}</span>{" "}
                <span className="font-semibold text-success">{off}% off</span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {line.savedForLater ? (
            <span className="text-xs text-muted-foreground">Saved for later</span>
          ) : (
            <QuantityStepper size="sm" value={line.qty} max={Math.min(10, line.stock)} pending={pending} onChange={(q) => updateQty(line.sku, q)} />
          )}
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => toggleSaved(line.sku)} disabled={pending} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              {line.savedForLater ? <Undo2 className="size-3.5" /> : <Bookmark className="size-3.5" />}
              {line.savedForLater ? "Move to cart" : "Save"}
            </button>
            <button type="button" onClick={() => remove(line.sku)} disabled={pending} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="size-3.5" /> Remove
            </button>
          </div>
        </div>
        {lowStock && !line.savedForLater && <p className="mt-1.5 text-xs font-medium text-primary">Only {line.stock} left</p>}
        {line.stock === 0 && <p className="mt-1.5 text-xs font-medium text-destructive">Out of stock — remove to continue</p>}
      </div>
    </motion.li>
  );
}
