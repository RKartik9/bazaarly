import type { CategoryDoc, ProductDoc } from "@/lib/db/models";
import type { CategoryDto, ProductCardDto, ProductDetailDto } from "./types";

type LeanCategory = Omit<CategoryDoc, "_id" | "parent"> & {
  _id: { toString(): string };
  parent?: { toString(): string } | null;
};

type LeanProduct = Omit<ProductDoc, "_id" | "category"> & {
  _id: { toString(): string };
  category: { toString(): string } | { _id: { toString(): string }; name: string; slug: string };
};

export function toCategoryDto(doc: LeanCategory): CategoryDto {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description ?? "",
    image: doc.image ?? "",
    tint: doc.tint ?? "blush",
    parent: doc.parent ? doc.parent.toString() : null,
    order: doc.order ?? 0,
  };
}

export function toProductCard(doc: LeanProduct): ProductCardDto {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    brand: doc.brand,
    image: doc.images[0] ?? "",
    hoverImage: doc.images[1] ?? null,
    price: doc.basePrice,
    mrp: doc.baseMrp,
    rating: { avg: doc.rating?.avg ?? 0, count: doc.rating?.count ?? 0 },
    totalStock: doc.totalStock ?? 0,
    isDeal: !!doc.isDeal && (!doc.dealEndsAt || doc.dealEndsAt > new Date()),
    dealEndsAt: doc.dealEndsAt ? doc.dealEndsAt.toISOString() : null,
    tags: doc.tags ?? [],
    variantCount: doc.variants.length,
  };
}

export function toProductDetail(doc: LeanProduct): ProductDetailDto {
  const category =
    typeof doc.category === "object" && "name" in doc.category
      ? { id: doc.category._id.toString(), name: doc.category.name, slug: doc.category.slug }
      : null;

  return {
    ...toProductCard(doc),
    description: doc.description ?? "",
    highlights: doc.highlights ?? [],
    specs: doc.specs ?? {},
    images: doc.images,
    variants: doc.variants.map((v) => ({
      sku: v.sku,
      attributes: v.attributes ?? {},
      price: v.price,
      mrp: v.mrp,
      stock: Math.max(0, v.stock - (v.reserved ?? 0)),
      image: v.image ?? "",
    })),
    variantAxes: doc.variantAxes ?? [],
    categoryPath: doc.categoryPath ?? [],
    category,
    soldCount: doc.soldCount ?? 0,
  };
}
