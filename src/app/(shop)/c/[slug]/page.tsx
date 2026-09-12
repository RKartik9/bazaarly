import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { CategoryHero } from "@/features/catalog/components/category-hero";
import { CatalogView } from "@/features/catalog/components/catalog-view";
import { getCategoryById, getCategoryBySlug, getCategoryChildren } from "@/features/catalog/queries";
import { searchCatalog } from "@/features/catalog/search";
import { loadCatalogParams, toCatalogFilters } from "@/features/catalog/search-params";
import { siteConfig } from "@/lib/site";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: category.description || `Shop ${category.name} on ${siteConfig.name}.`,
    openGraph: category.image ? { images: [category.image] } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [query, children, parent] = await Promise.all([
    loadCatalogParams(searchParams),
    getCategoryChildren(category.id),
    category.parent ? getCategoryById(category.parent) : null,
  ]);
  const result = await searchCatalog(toCatalogFilters(query, category.slug));

  return (
    <div className="container-x space-y-8 py-6 sm:py-8">
      <CategoryHero category={category} parent={parent} subcategories={children} total={result.total} />
      <CatalogView result={result} subcategories={children} />
    </div>
  );
}
