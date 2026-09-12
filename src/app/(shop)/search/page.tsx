import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { CatalogView } from "@/features/catalog/components/catalog-view";
import { Crumbs } from "@/features/catalog/components/crumbs";
import { searchCatalog } from "@/features/catalog/search";
import { loadCatalogParams, toCatalogFilters } from "@/features/catalog/search-params";

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await loadCatalogParams(searchParams);
  return { title: q ? `Results for "${q}"` : "All products", robots: { index: false } };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = await loadCatalogParams(searchParams);
  const result = await searchCatalog(toCatalogFilters(query));

  return (
    <div className="container-x space-y-6 py-6 sm:py-8">
      <div>
        <Crumbs items={[{ label: query.q ? "Search" : "All products" }]} />
        <h1 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">
          {query.q ? (
            <>
              Results for <span className="text-primary">&ldquo;{query.q}&rdquo;</span>
            </>
          ) : (
            "Everything in store"
          )}
        </h1>
      </div>
      <CatalogView
        result={result}
        emptyTitle={query.q ? `No results for "${query.q}"` : undefined}
        emptyHint={query.q ? "Check the spelling or try a broader term like a brand or category." : undefined}
      />
    </div>
  );
}
