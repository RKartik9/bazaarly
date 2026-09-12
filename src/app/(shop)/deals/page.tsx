import type { Metadata } from "next";
import { Flame } from "lucide-react";
import type { SearchParams } from "nuqs/server";
import { Countdown } from "@/components/countdown";
import { CatalogView } from "@/features/catalog/components/catalog-view";
import { Crumbs } from "@/features/catalog/components/crumbs";
import { searchCatalog } from "@/features/catalog/search";
import { loadCatalogParams, toCatalogFilters } from "@/features/catalog/search-params";

export const metadata: Metadata = {
  title: "Deals of the day",
  description: "Limited-time prices across electronics, fashion, home and more.",
};

export default async function DealsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await loadCatalogParams(searchParams);
  const result = await searchCatalog({ ...toCatalogFilters(query), deals: true });
  const soonest = result.items.map((d) => d.dealEndsAt).filter(Boolean).sort()[0];

  return (
    <div className="container-x space-y-8 py-6 sm:py-8">
      <section className="relative overflow-hidden rounded-3xl bg-ink px-6 py-10 text-background sm:px-10">
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-saffron/30 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Crumbs items={[{ label: "Deals" }]} className="[&_a]:text-background/60 [&_span]:text-background" />
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest">
              <Flame className="size-3.5" /> Limited time
            </p>
            <h1 className="mt-3 font-heading text-4xl font-extrabold leading-none sm:text-5xl">Deals of the day</h1>
            <p className="mt-3 max-w-lg text-background/70">
              {result.total.toLocaleString("en-IN")} products on offer. Prices reset when the timer runs out.
            </p>
          </div>
          {soonest && (
            <div className="rounded-2xl bg-background/10 p-4 backdrop-blur">
              <p className="mb-1 text-xs font-medium text-background/70">Next deal ends in</p>
              <Countdown until={soonest} className="text-background" />
            </div>
          )}
        </div>
      </section>
      <CatalogView result={result} showDealsToggle={false} emptyTitle="No live deals right now" emptyHint="New deals drop every morning. Check back soon." />
    </div>
  );
}
