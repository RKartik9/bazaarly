import type { MetadataRoute } from "next";
import { connectDb } from "@/lib/db/mongoose";
import { Category, Product } from "@/lib/db/models";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDb();
  const [products, categories] = await Promise.all([
    Product.find({ status: "active" }, { slug: 1, updatedAt: 1 }).lean(),
    Category.find({ isActive: true }, { slug: 1, updatedAt: 1 }).lean(),
  ]);
  const base = siteConfig.url;

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/deals`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/search`, changeFrequency: "weekly", priority: 0.5 },
    ...categories.map((c) => ({ url: `${base}/c/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: `${base}/p/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
