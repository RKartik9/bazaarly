import { SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/features/products/components/product-grid";
import type { CatalogResult, CategoryDto } from "../types";
import { ActiveFilters } from "./active-filters";
import { CatalogPagination } from "./catalog-pagination";
import { CatalogToolbar } from "./catalog-toolbar";
import { FilterPanel } from "./filter-panel";

type Props = {
  result: CatalogResult;
  subcategories?: CategoryDto[];
  showDealsToggle?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
};

export function CatalogView({ result, subcategories, showDealsToggle = true, emptyTitle, emptyHint }: Props) {
  return (
    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-28">
          <FilterPanel facets={result.facets} subcategories={subcategories} showDealsToggle={showDealsToggle} />
        </div>
      </aside>

      <section className="min-w-0 space-y-5">
        <CatalogToolbar total={result.total} facets={result.facets} subcategories={subcategories} showDealsToggle={showDealsToggle} />
        <ActiveFilters />

        {result.items.length ? (
          <ProductGrid products={result.items} columns={4} />
        ) : (
          <CatalogEmpty title={emptyTitle} hint={emptyHint} />
        )}

        <CatalogPagination page={result.page} pageCount={result.pageCount} />
      </section>
    </div>
  );
}

function CatalogEmpty({ title, hint }: { title?: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-blush text-primary">
        <SearchX className="size-7" />
      </div>
      <h3 className="mt-4 font-heading text-xl font-bold">{title ?? "Nothing matches those filters"}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint ?? "Try removing a filter or two, or browse a different category."}</p>
      <Button asChild variant="outline" className="mt-6 rounded-full">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
