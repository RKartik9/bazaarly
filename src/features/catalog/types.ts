export type CategoryDto = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  tint: string;
  parent: string | null;
  order: number;
};

export type NavCategory = CategoryDto & { children: CategoryDto[] };

export type ProductVariantDto = {
  sku: string;
  attributes: Record<string, string>;
  price: number;
  mrp: number;
  stock: number;
  image: string;
};

export type ProductCardDto = {
  id: string;
  title: string;
  slug: string;
  brand: string;
  image: string;
  hoverImage: string | null;
  price: number;
  mrp: number;
  rating: { avg: number; count: number };
  totalStock: number;
  isDeal: boolean;
  dealEndsAt: string | null;
  tags: string[];
  variantCount: number;
};

export type ProductDetailDto = ProductCardDto & {
  description: string;
  highlights: string[];
  specs: Record<string, string>;
  images: string[];
  variants: ProductVariantDto[];
  variantAxes: string[];
  categoryPath: string[];
  category: { id: string; name: string; slug: string } | null;
  soldCount: number;
};

export type SortOption = "relevance" | "newest" | "price_asc" | "price_desc" | "rating" | "popular";

export type CatalogFilters = {
  q?: string;
  category?: string;
  brands: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock: boolean;
  deals: boolean;
  sort: SortOption;
  page: number;
  attributes: Record<string, string[]>;
};

export type FacetValue = { value: string; count: number };

export type CatalogFacets = {
  brands: FacetValue[];
  priceRange: { min: number; max: number };
  attributes: Record<string, FacetValue[]>;
};

export type CatalogResult = {
  items: ProductCardDto[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  facets: CatalogFacets;
};
