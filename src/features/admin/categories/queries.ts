import "server-only";
import { connectDb } from "@/lib/db/mongoose";
import { Category, Product } from "@/lib/db/models";
import type { CategoryFormValues } from "./schemas";

export type AdminCategoryRow = CategoryFormValues & {
  id: string;
  productCount: number;
  children: AdminCategoryRow[];
};

export async function listAdminCategories(): Promise<AdminCategoryRow[]> {
  await connectDb();
  const [docs, counts] = await Promise.all([
    Category.find().sort({ order: 1, name: 1 }).lean(),
    Product.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
  ]);
  const countById = new Map(counts.map((c) => [c._id.toString(), c.count]));

  const rows: AdminCategoryRow[] = docs.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    slug: d.slug,
    description: d.description,
    image: d.image,
    tint: d.tint as AdminCategoryRow["tint"],
    parent: d.parent?.toString() ?? "",
    order: d.order,
    isActive: d.isActive,
    productCount: countById.get(d._id.toString()) ?? 0,
    children: [],
  }));

  const byId = new Map(rows.map((r) => [r.id, r]));
  const roots: AdminCategoryRow[] = [];
  for (const row of rows) {
    const parent = row.parent ? byId.get(row.parent) : undefined;
    if (parent) parent.children.push(row);
    else roots.push(row);
  }
  return roots;
}
