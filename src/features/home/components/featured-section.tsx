import { SectionHeading } from "@/components/section-heading";
import type { ProductCardDto } from "@/features/catalog/types";
import { ProductGrid } from "@/features/products/components/product-grid";
import { ProductRail } from "@/features/products/components/product-rail";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  href: string;
  products: ProductCardDto[];
  layout?: "grid" | "rail";
};

export function FeaturedSection({ eyebrow, title, description, href, products, layout = "grid" }: Props) {
  if (!products.length) return null;
  return (
    <section className="container-x py-16">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} href={href} />
      {layout === "grid" ? <ProductGrid products={products} /> : <ProductRail products={products} />}
    </section>
  );
}
