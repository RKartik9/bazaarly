"use client";

import { useMemo, useState } from "react";
import type { ProductDetailDto, ProductVariantDto } from "@/features/catalog/types";

type Selection = Record<string, string>;

function firstInStock(variants: ProductVariantDto[]) {
  return variants.find((v) => v.stock > 0) ?? variants[0];
}

export function useVariantSelection(product: ProductDetailDto) {
  const { variants, variantAxes } = product;
  const [selection, setSelection] = useState<Selection>(() => ({ ...firstInStock(variants).attributes }));

  const selected = useMemo(
    () => variants.find((v) => variantAxes.every((axis) => v.attributes[axis] === selection[axis])) ?? null,
    [variants, variantAxes, selection],
  );

  const optionsFor = (axis: string) => {
    const values = [...new Set(variants.map((v) => v.attributes[axis]).filter(Boolean))];
    return values.map((value) => {
      const candidates = variants.filter(
        (v) =>
          v.attributes[axis] === value &&
          variantAxes.every((other) => other === axis || !selection[other] || v.attributes[other] === selection[other]),
      );
      const anyMatch = variants.some((v) => v.attributes[axis] === value);
      return {
        value,
        available: candidates.some((v) => v.stock > 0),
        exists: candidates.length > 0 || anyMatch,
        image: candidates[0]?.image ?? variants.find((v) => v.attributes[axis] === value)?.image ?? "",
      };
    });
  };

  const select = (axis: string, value: string) => {
    setSelection((prev) => {
      const next = { ...prev, [axis]: value };
      const exact = variants.find((v) => variantAxes.every((a) => v.attributes[a] === next[a]));
      if (exact) return next;
      const fallback = variants.filter((v) => v.attributes[axis] === value);
      return { ...(firstInStock(fallback) ?? fallback[0]).attributes };
    });
  };

  return { selection, selected, optionsFor, select };
}
