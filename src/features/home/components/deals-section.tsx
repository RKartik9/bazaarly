import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import type { ProductCardDto } from "@/features/catalog/types";
import { ProductRail } from "@/features/products/components/product-rail";

export function DealsSection({ deals }: { deals: ProductCardDto[] }) {
  if (!deals.length) return null;
  const soonest = deals.map((d) => d.dealEndsAt).filter(Boolean).sort()[0];

  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 -skew-y-2 bg-gradient-to-r from-primary/10 via-saffron/20 to-blush" />
      <div className="container-x relative">
        <Reveal className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground">
              <Flame className="size-3.5" /> Deals of the day
            </p>
            <h2 className="font-heading text-3xl font-bold leading-[1.05] sm:text-4xl">Prices that won&apos;t wait around</h2>
          </div>
          <div className="flex items-center gap-4">
            {soonest && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Ends in</p>
                <Countdown until={soonest} />
              </div>
            )}
            <Button asChild variant="ink" size="lg" className="rounded-full">
              <Link href="/deals">
                All deals <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
        <ProductRail products={deals} />
      </div>
    </section>
  );
}
