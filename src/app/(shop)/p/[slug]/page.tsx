import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductGridSkeleton } from "@/components/feedback/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/components/section-heading";
import { Crumbs } from "@/features/catalog/components/crumbs";
import { getNavCategories, getProductBySlug, getRelatedProducts } from "@/features/catalog/queries";
import { ProductDetails } from "@/features/products/components/product-details";
import { ProductHero } from "@/features/products/components/product-hero";
import { ProductRail } from "@/features/products/components/product-rail";
import { ProductJsonLd } from "@/features/products/components/product-json-ld";
import { ReviewsSection } from "@/features/reviews/components/reviews-section";
import type { ProductDetailDto } from "@/features/catalog/types";
import { siteConfig } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.title} – ${product.brand}`,
    description: product.description.slice(0, 160),
    openGraph: { images: product.images.slice(0, 1), type: "website", siteName: siteConfig.name },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const nav = await getNavCategories();
  const all = nav.flatMap((c) => [c, ...c.children]);
  const crumbs = product.categoryPath
    .map((s) => all.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .map((c) => ({ label: c.name, href: `/c/${c.slug}` }));

  return (
    <div className="container-x space-y-14 py-6 sm:py-8">
      <ProductJsonLd product={product} />
      <div className="space-y-6">
        <Crumbs items={[...crumbs, { label: product.title }]} />
        <ProductHero product={product} />
      </div>
      <ProductDetails product={product} />
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-3xl" />}>
        <ReviewsSection productId={product.id} />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <RelatedProducts product={product} />
      </Suspense>
    </div>
  );
}

async function RelatedProducts({ product }: { product: ProductDetailDto }) {
  const related = await getRelatedProducts(product);
  if (!related.length) return null;
  return (
    <section>
      <SectionHeading eyebrow="You may also like" title="Pairs well with this" />
      <ProductRail products={related} />
    </section>
  );
}
