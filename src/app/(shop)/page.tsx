import { BrandMarquee } from "@/features/home/components/brand-marquee";
import { CategoryMosaic } from "@/features/home/components/category-mosaic";
import { DealsSection } from "@/features/home/components/deals-section";
import { FeaturedSection } from "@/features/home/components/featured-section";
import { Hero } from "@/features/home/components/hero";
import { Perks } from "@/features/home/components/perks";
import { Testimonials } from "@/features/home/components/testimonials";
import {
  getBestsellers,
  getBrands,
  getDealProducts,
  getFeaturedProducts,
  getNavCategories,
  getNewArrivals,
} from "@/features/catalog/queries";

export default async function HomePage() {
  const [featured, deals, bestsellers, arrivals, categories, brands] = await Promise.all([
    getFeaturedProducts(8),
    getDealProducts(10),
    getBestsellers(8),
    getNewArrivals(10),
    getNavCategories(),
    getBrands(),
  ]);

  return (
    <>
      <Hero spotlight={featured.slice(0, 3)} />
      <BrandMarquee brands={brands} />
      <CategoryMosaic categories={categories} />
      <DealsSection deals={deals} />
      <FeaturedSection
        eyebrow="Editor's picks"
        title="Featured this week"
        description="Hand-picked by our team across every category."
        href="/search?sort=popular"
        products={featured}
      />
      <Perks />
      <FeaturedSection eyebrow="Trending" title="Bestsellers right now" href="/search?sort=popular" products={bestsellers} layout="rail" />
      <FeaturedSection eyebrow="Just in" title="New arrivals" href="/search?sort=newest" products={arrivals} layout="rail" />
      <Testimonials />
    </>
  );
}
