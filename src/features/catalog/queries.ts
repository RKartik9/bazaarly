import "server-only";
import { cache } from "react";
import { connectDb } from "@/lib/db/mongoose";
import { Category, Product } from "@/lib/db/models";
import { toCategoryDto, toProductCard, toProductDetail } from "./mappers";
import type { CategoryDto, NavCategory, ProductCardDto, ProductDetailDto } from "./types";

const ACTIVE = { status: "active" } as const;

export const getNavCategories = cache(async (): Promise<NavCategory[]> => {
  await connectDb();
  const docs = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
  const all = docs.map(toCategoryDto);
  return all
    .filter((c) => !c.parent)
    .map((parent) => ({ ...parent, children: all.filter((c) => c.parent === parent.id) }));
});

export const getCategoryBySlug = cache(async (slug: string): Promise<CategoryDto | null> => {
  await connectDb();
  const doc = await Category.findOne({ slug, isActive: true }).lean();
  return doc ? toCategoryDto(doc) : null;
});

export const getCategoryById = cache(async (id: string): Promise<CategoryDto | null> => {
  await connectDb();
  const doc = await Category.findById(id).lean();
  return doc ? toCategoryDto(doc) : null;
});

export const getCategoryChildren = cache(async (parentId: string): Promise<CategoryDto[]> => {
  await connectDb();
  const docs = await Category.find({ parent: parentId, isActive: true }).sort({ order: 1 }).lean();
  return docs.map(toCategoryDto);
});

export async function getFeaturedProducts(limit = 8): Promise<ProductCardDto[]> {
  await connectDb();
  const docs = await Product.find({ ...ACTIVE, isFeatured: true }).sort({ soldCount: -1 }).limit(limit).lean();
  return docs.map(toProductCard);
}

export async function getDealProducts(limit = 8): Promise<ProductCardDto[]> {
  await connectDb();
  const docs = await Product.find({ ...ACTIVE, isDeal: true, dealEndsAt: { $gt: new Date() } })
    .sort({ dealEndsAt: 1 })
    .limit(limit)
    .lean();
  return docs.map(toProductCard);
}

export async function getNewArrivals(limit = 8): Promise<ProductCardDto[]> {
  await connectDb();
  const docs = await Product.find(ACTIVE).sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map(toProductCard);
}

export async function getBestsellers(limit = 8): Promise<ProductCardDto[]> {
  await connectDb();
  const docs = await Product.find(ACTIVE).sort({ soldCount: -1, "rating.avg": -1 }).limit(limit).lean();
  return docs.map(toProductCard);
}

export const getProductBySlug = cache(async (slug: string): Promise<ProductDetailDto | null> => {
  await connectDb();
  const doc = await Product.findOne({ slug, ...ACTIVE })
    .populate<{ category: { _id: { toString(): string }; name: string; slug: string } }>("category", "name slug")
    .lean();
  return doc ? toProductDetail(doc) : null;
});

export async function getRelatedProducts(product: ProductDetailDto, limit = 8): Promise<ProductCardDto[]> {
  await connectDb();
  const leaf = product.categoryPath.at(-1);
  const docs = await Product.find({
    ...ACTIVE,
    _id: { $ne: product.id },
    $or: [{ categoryPath: leaf }, { brand: product.brand }],
  })
    .sort({ soldCount: -1 })
    .limit(limit)
    .lean();
  return docs.map(toProductCard);
}

export async function getProductsByIds(ids: string[]): Promise<ProductCardDto[]> {
  if (!ids.length) return [];
  await connectDb();
  const docs = await Product.find({ _id: { $in: ids }, ...ACTIVE }).lean();
  const order = new Map(ids.map((id, i) => [id, i]));
  return docs.map(toProductCard).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export async function getBrands(): Promise<string[]> {
  await connectDb();
  const brands = await Product.distinct("brand", ACTIVE);
  return brands.sort();
}

export async function getSearchSuggestions(q: string, limit = 6) {
  await connectDb();
  const safe = q.trim().slice(0, 60);
  if (safe.length < 2) return { products: [], categories: [] };

  const regex = new RegExp(safe.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const [products, categories] = await Promise.all([
    Product.find({ ...ACTIVE, $or: [{ title: regex }, { brand: regex }, { tags: regex }] })
      .select("title slug brand images basePrice")
      .sort({ soldCount: -1 })
      .limit(limit)
      .lean(),
    Category.find({ isActive: true, name: regex }).select("name slug").limit(4).lean(),
  ]);

  return {
    products: products.map((p) => ({
      title: p.title,
      slug: p.slug,
      brand: p.brand,
      image: p.images[0] ?? "",
      price: p.basePrice,
    })),
    categories: categories.map((c) => ({ name: c.name, slug: c.slug })),
  };
}
