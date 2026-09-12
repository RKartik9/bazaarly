import "server-only";
import type { PipelineStage } from "mongoose";
import { connectDb } from "@/lib/db/mongoose";
import { Product } from "@/lib/db/models";

type Filter = Record<string, unknown>;
import { toProductCard } from "./mappers";
import { PAGE_SIZE } from "./search-params";
import type { CatalogFacets, CatalogFilters, CatalogResult, FacetValue, SortOption } from "./types";

const FACET_ATTRIBUTES = ["color", "size", "storage", "ram"];

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function baseMatch(filters: CatalogFilters): Filter {
  const match: Filter = { status: "active" };
  if (filters.category) match.categoryPath = filters.category;
  if (filters.deals) {
    match.isDeal = true;
    match.dealEndsAt = { $gt: new Date() };
  }
  if (filters.q) {
    const regex = new RegExp(escapeRegex(filters.q.slice(0, 80)), "i");
    match.$or = [{ title: regex }, { brand: regex }, { tags: regex }, { description: regex }];
  }
  return match;
}

function refineMatch(filters: CatalogFilters): Filter {
  const match: Filter = {};
  if (filters.brands.length) match.brand = { $in: filters.brands };
  if (filters.minPrice != null || filters.maxPrice != null) {
    match.basePrice = {
      ...(filters.minPrice != null ? { $gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { $lte: filters.maxPrice } : {}),
    };
  }
  if (filters.rating) match["rating.avg"] = { $gte: filters.rating };
  if (filters.inStock) match.totalStock = { $gt: 0 };
  for (const [key, values] of Object.entries(filters.attributes)) {
    if (!FACET_ATTRIBUTES.includes(key) || !values.length) continue;
    match[`variants.attributes.${key}`] = { $in: values };
  }
  return match;
}

function sortStage(sort: SortOption, hasQuery: boolean): Record<string, 1 | -1> {
  switch (sort) {
    case "newest":
      return { createdAt: -1, _id: -1 };
    case "price_asc":
      return { basePrice: 1, _id: 1 };
    case "price_desc":
      return { basePrice: -1, _id: 1 };
    case "rating":
      return { "rating.avg": -1, "rating.count": -1, _id: 1 };
    case "popular":
      return { soldCount: -1, _id: 1 };
    default:
      return hasQuery ? { soldCount: -1, "rating.avg": -1, _id: 1 } : { isFeatured: -1, soldCount: -1, _id: 1 };
  }
}

function facetPipeline(): Record<string, PipelineStage.FacetPipelineStage[]> {
  const attributeFacets = Object.fromEntries(
    FACET_ATTRIBUTES.map((key) => [
      `attr_${key}`,
      [
        { $unwind: "$variants" },
        { $match: { [`variants.attributes.${key}`]: { $exists: true, $ne: null } } },
        { $group: { _id: `$variants.attributes.${key}`, products: { $addToSet: "$_id" } } },
        { $project: { _id: 0, value: "$_id", count: { $size: "$products" } } },
        { $sort: { count: -1, value: 1 } },
        { $limit: 30 },
      ] as PipelineStage.FacetPipelineStage[],
    ]),
  );

  return {
    brands: [
      { $group: { _id: "$brand", count: { $sum: 1 } } },
      { $project: { _id: 0, value: "$_id", count: 1 } },
      { $sort: { count: -1, value: 1 } },
      { $limit: 40 },
    ],
    price: [{ $group: { _id: null, min: { $min: "$basePrice" }, max: { $max: "$basePrice" } } }],
    ...attributeFacets,
  };
}

type FacetRow = {
  brands: FacetValue[];
  price: { min: number; max: number }[];
} & Record<`attr_${string}`, FacetValue[]>;

function toFacets(row: FacetRow | undefined): CatalogFacets {
  const attributes: Record<string, FacetValue[]> = {};
  for (const key of FACET_ATTRIBUTES) {
    const values = row?.[`attr_${key}`] ?? [];
    if (values.length > 1) attributes[key] = values;
  }
  return {
    brands: row?.brands ?? [],
    priceRange: row?.price?.[0] ?? { min: 0, max: 0 },
    attributes,
  };
}

export async function searchCatalog(filters: CatalogFilters): Promise<CatalogResult> {
  await connectDb();
  const base = baseMatch(filters);
  const refine = refineMatch(filters);
  const skip = (filters.page - 1) * PAGE_SIZE;

  const [docs, total, facetRows] = await Promise.all([
    Product.find({ ...base, ...refine })
      .sort(sortStage(filters.sort, !!filters.q))
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Product.countDocuments({ ...base, ...refine }),
    Product.aggregate<FacetRow>([{ $match: base }, { $facet: facetPipeline() }]),
  ]);

  return {
    items: docs.map(toProductCard),
    total,
    page: filters.page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    facets: toFacets(facetRows[0]),
  };
}
