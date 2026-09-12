"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { formatPrice } from "@/lib/money";
import { useCatalogParams } from "./use-catalog-params";

type Chip = { key: string; label: string; onRemove: () => void };

export function ActiveFilters() {
  const { params, attributes, update, toggleBrand, toggleAttribute, clearAll } = useCatalogParams();

  const chips: Chip[] = [
    ...params.brand.map((b) => ({ key: `brand-${b}`, label: b, onRemove: () => toggleBrand(b) })),
    ...Object.entries(attributes).flatMap(([k, values]) =>
      values.map((v) => ({ key: `${k}-${v}`, label: `${k}: ${v}`, onRemove: () => toggleAttribute(k, v) })),
    ),
  ];
  if (params.min != null || params.max != null) {
    const label = [params.min != null ? formatPrice(params.min) : "₹0", params.max != null ? formatPrice(params.max) : "∞"].join(" – ");
    chips.push({ key: "price", label, onRemove: () => update({ min: null, max: null }) });
  }
  if (params.rating) chips.push({ key: "rating", label: `${params.rating}★ & up`, onRemove: () => update({ rating: null }) });
  if (params.stock) chips.push({ key: "stock", label: "In stock", onRemove: () => update({ stock: false }) });
  if (params.deals) chips.push({ key: "deals", label: "Deals", onRemove: () => update({ deals: false }) });

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.button
            key={chip.key}
            type="button"
            layout
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            onClick={chip.onRemove}
            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary transition hover:bg-primary/20"
          >
            {chip.label}
            <X className="size-3" />
          </motion.button>
        ))}
      </AnimatePresence>
      <button type="button" onClick={clearAll} className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:underline">
        Clear all
      </button>
    </div>
  );
}
