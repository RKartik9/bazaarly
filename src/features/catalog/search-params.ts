import {
  createLoader,
  createSerializer,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import type { CatalogFilters, SortOption } from "./types";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "popular", label: "Popularity" },
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Customer rating" },
];

export const PAGE_SIZE = 24;

const sortValues = SORT_OPTIONS.map((o) => o.value) as [SortOption, ...SortOption[]];

export const catalogParsers = {
  q: parseAsString.withDefault(""),
  brand: parseAsArrayOf(parseAsString).withDefault([]),
  min: parseAsInteger,
  max: parseAsInteger,
  rating: parseAsInteger,
  stock: parseAsBoolean.withDefault(false),
  deals: parseAsBoolean.withDefault(false),
  sort: parseAsStringLiteral(sortValues).withDefault("relevance"),
  page: parseAsInteger.withDefault(1),
  attr: parseAsArrayOf(parseAsString).withDefault([]),
};

export const loadCatalogParams = createLoader(catalogParsers);
export const serializeCatalogParams = createSerializer(catalogParsers);

export type CatalogParams = Awaited<ReturnType<typeof loadCatalogParams>>;

export function parseAttributeParams(attr: string[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const pair of attr) {
    const [key, value] = pair.split(":");
    if (!key || !value) continue;
    (out[key] ??= []).push(value);
  }
  return out;
}

export function toCatalogFilters(params: CatalogParams, category?: string): CatalogFilters {
  return {
    q: params.q || undefined,
    category,
    brands: params.brand.slice(0, 20),
    minPrice: params.min ?? undefined,
    maxPrice: params.max ?? undefined,
    rating: params.rating ?? undefined,
    inStock: params.stock,
    deals: params.deals,
    sort: params.sort,
    page: Math.max(1, Math.min(params.page, 200)),
    attributes: parseAttributeParams(params.attr.slice(0, 30)),
  };
}
