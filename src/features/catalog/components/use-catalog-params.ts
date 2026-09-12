"use client";

import { useTransition } from "react";
import { useQueryStates } from "nuqs";
import { catalogParsers, parseAttributeParams } from "../search-params";

export function useCatalogParams() {
  const [isPending, startTransition] = useTransition();
  const [params, setParams] = useQueryStates(catalogParsers, {
    shallow: false,
    startTransition,
    clearOnDefault: true,
  });

  const update = (patch: Partial<typeof params>, resetPage = true) =>
    setParams({ ...patch, ...(resetPage ? { page: 1 } : {}) });

  const toggleBrand = (brand: string) =>
    update({ brand: params.brand.includes(brand) ? params.brand.filter((b) => b !== brand) : [...params.brand, brand] });

  const toggleAttribute = (key: string, value: string) => {
    const token = `${key}:${value}`;
    update({ attr: params.attr.includes(token) ? params.attr.filter((a) => a !== token) : [...params.attr, token] });
  };

  const clearAll = () =>
    setParams({ brand: [], min: null, max: null, rating: null, stock: false, deals: false, attr: [], page: 1 });

  const activeCount =
    params.brand.length +
    params.attr.length +
    (params.min != null || params.max != null ? 1 : 0) +
    (params.rating ? 1 : 0) +
    (params.stock ? 1 : 0) +
    (params.deals ? 1 : 0);

  return {
    params,
    attributes: parseAttributeParams(params.attr),
    isPending,
    update,
    toggleBrand,
    toggleAttribute,
    clearAll,
    activeCount,
  };
}
