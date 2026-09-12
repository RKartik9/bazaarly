import "server-only";
import { connectDb } from "@/lib/db/mongoose";
import { Category, Product, type ProductDoc } from "@/lib/db/models";
import type { ProductStatus } from "@/lib/db/enums";
import { ADMIN_PAGE_SIZE, type AdminProductParams } from "./search-params";
import type { ProductFormValues } from "./schemas";

export type AdminProductRow = {
  id: string;
  title: string;
  slug: string;
  brand: string;
  image: string;
  categoryName: string;
  basePrice: number;
  totalStock: number;
  variantCount: number;
  lowStock: boolean;
  status: ProductStatus;
  isFeatured: boolean;
  isDeal: boolean;
  soldCount: number;
  updatedAt: string;
};

export type AdminProductPage = { rows: AdminProductRow[]; total: number; totalPages: number; page: number };

export async function listAdminProducts(params: AdminProductParams): Promise<AdminProductPage> {
  await connectDb();
  const filter: Record<string, unknown> = {};
  if (params.q) filter.$text = { $search: params.q };
  if (params.status !== "all") filter.status = params.status;
  if (params.category) filter.category = params.category;
  if (params.stock === "out") filter.totalStock = 0;
  if (params.stock === "low") filter.variants = { $elemMatch: { stock: { $lte: 5 } } };

  const total = await Product.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const page = Math.min(Math.max(1, params.page), totalPages);

  const docs = await Product.find(filter)
    .sort(params.q ? { score: { $meta: "textScore" } } : { updatedAt: -1 })
    .skip((page - 1) * ADMIN_PAGE_SIZE)
    .limit(ADMIN_PAGE_SIZE)
    .populate<{ category: { name: string } | null }>("category", "name")
    .lean();

  const rows = docs.map((d) => ({
    id: d._id.toString(),
    title: d.title,
    slug: d.slug,
    brand: d.brand,
    image: d.images[0] ?? "",
    categoryName: d.category?.name ?? "—",
    basePrice: d.basePrice,
    totalStock: d.totalStock,
    variantCount: d.variants.length,
    lowStock: d.variants.some((v) => v.stock <= 5),
    status: d.status as ProductStatus,
    isFeatured: d.isFeatured,
    isDeal: d.isDeal,
    soldCount: d.soldCount,
    updatedAt: d.updatedAt.toISOString(),
  }));

  return { rows, total, totalPages, page };
}

export type CategoryOption = { id: string; label: string; parent: string | null };

export async function getCategoryOptions(): Promise<CategoryOption[]> {
  await connectDb();
  const docs = await Category.find().sort({ order: 1 }).lean();
  const byId = new Map(docs.map((d) => [d._id.toString(), d]));
  return docs.map((d) => {
    const parent = d.parent ? byId.get(d.parent.toString()) : null;
    return { id: d._id.toString(), label: parent ? `${parent.name} › ${d.name}` : d.name, parent: d.parent?.toString() ?? null };
  });
}

export function toProductFormValues(doc: ProductDoc): ProductFormValues {
  return {
    title: doc.title,
    slug: doc.slug,
    brand: doc.brand,
    category: doc.category.toString(),
    description: doc.description,
    highlights: doc.highlights,
    specs: Object.entries(doc.specs ?? {}).map(([key, value]) => ({ key, value })),
    images: doc.images,
    variantAxes: doc.variantAxes,
    variants: doc.variants.map((v) => ({ sku: v.sku, attributes: v.attributes ?? {}, price: v.price, mrp: v.mrp, stock: v.stock, image: v.image ?? "" })),
    tags: doc.tags,
    isFeatured: doc.isFeatured,
    isDeal: doc.isDeal,
    dealEndsAt: doc.dealEndsAt ? doc.dealEndsAt.toISOString() : "",
    status: doc.status as ProductStatus,
  };
}

export async function getAdminProduct(id: string) {
  await connectDb();
  const doc = await Product.findById(id).lean();
  if (!doc) return null;
  return { id: doc._id.toString(), values: toProductFormValues(doc), reserved: doc.variants.map((v) => ({ sku: v.sku, reserved: v.reserved })) };
}

export async function getProductStatusCounts() {
  await connectDb();
  const rows = await Product.aggregate<{ _id: ProductStatus; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  const counts: Record<"all" | ProductStatus, number> = { all: 0, active: 0, draft: 0, archived: 0 };
  for (const r of rows) {
    counts[r._id] = r.count;
    counts.all += r.count;
  }
  return counts;
}
