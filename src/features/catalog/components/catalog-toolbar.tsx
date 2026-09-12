"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { SORT_OPTIONS } from "../search-params";
import type { CatalogFacets, CategoryDto, SortOption } from "../types";
import { FilterPanel } from "./filter-panel";
import { useCatalogParams } from "./use-catalog-params";

type Props = {
  total: number;
  facets: CatalogFacets;
  subcategories?: CategoryDto[];
  showDealsToggle?: boolean;
};

export function CatalogToolbar({ total, facets, subcategories, showDealsToggle }: Props) {
  const { params, update, activeCount, isPending } = useCatalogParams();

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        <span className="font-semibold text-foreground tabular-nums">{total.toLocaleString("en-IN")}</span>{" "}
        {total === 1 ? "product" : "products"}
        {isPending && <span className="ml-2 inline-block size-1.5 animate-pulse rounded-full bg-primary align-middle" />}
      </p>

      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <SlidersHorizontal className="size-4" />
              Filters
              {activeCount > 0 && <Badge className="ml-1 h-5 min-w-5 justify-center rounded-full px-1">{activeCount}</Badge>}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-5">
            <SheetHeader className="p-0 pb-2">
              <SheetTitle className="sr-only">Filters</SheetTitle>
            </SheetHeader>
            <FilterPanel facets={facets} subcategories={subcategories} showDealsToggle={showDealsToggle} />
          </SheetContent>
        </Sheet>

        <Select value={params.sort} onValueChange={(v) => update({ sort: v as SortOption })}>
          <SelectTrigger size="sm" className="w-[170px] rounded-full bg-card" aria-label="Sort products">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
