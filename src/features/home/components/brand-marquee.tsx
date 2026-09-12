import { Marquee } from "@/components/motion/marquee";

export function BrandMarquee({ brands }: { brands: string[] }) {
  if (!brands.length) return null;
  return (
    <section className="border-y bg-card/60 py-8">
      <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Trusted brands, one bag</p>
      <Marquee speed={45}>
        {brands.map((brand) => (
          <span key={brand} className="font-heading text-2xl font-bold tracking-tight text-foreground/50 transition-colors hover:text-primary sm:text-3xl">
            {brand}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
