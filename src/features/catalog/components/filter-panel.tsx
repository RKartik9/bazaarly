"use client";

import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { CatalogFacets, CategoryDto } from "../types";
import { CheckList, PriceRange, RatingFilter, ToggleRow } from "./filter-groups";
import { useCatalogParams } from "./use-catalog-params";

type Props = {
  facets: CatalogFacets;
  subcategories?: CategoryDto[];
  showDealsToggle?: boolean;
};

export function FilterPanel({ facets, subcategories = [], showDealsToggle = true }: Props) {
  const { params, attributes, update, toggleBrand, toggleAttribute, clearAll, activeCount } = useCatalogParams();
  const attributeKeys = Object.keys(facets.attributes);
  const defaultOpen = ["category", "price", "brand", ...attributeKeys.slice(0, 2)];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold">Filters</h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs text-primary">
            Clear all ({activeCount})
          </Button>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <ToggleRow id="stock" label="In stock only" checked={params.stock} onChange={(v) => update({ stock: v })} />
        {showDealsToggle && <ToggleRow id="deals" label="Deals only" checked={params.deals} onChange={(v) => update({ deals: v })} />}
      </div>

      <Accordion type="multiple" defaultValue={defaultOpen} className="w-full">
        {subcategories.length > 0 && (
          <AccordionItem value="category">
            <AccordionTrigger className="text-sm font-semibold">Category</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1.5">
                {subcategories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/c/${c.slug}`} className="block rounded-md px-2 py-1 text-sm text-foreground/80 transition hover:bg-muted hover:text-foreground">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-semibold">Price</AccordionTrigger>
          <AccordionContent className="px-1 pt-2">
            <PriceRange
              range={facets.priceRange}
              value={{ min: params.min ?? undefined, max: params.max ?? undefined }}
              onCommit={(min, max) => update({ min, max })}
            />
          </AccordionContent>
        </AccordionItem>

        {facets.brands.length > 1 && (
          <AccordionItem value="brand">
            <AccordionTrigger className="text-sm font-semibold">Brand</AccordionTrigger>
            <AccordionContent>
              <CheckList name="brand" values={facets.brands} selected={params.brand} onToggle={toggleBrand} />
            </AccordionContent>
          </AccordionItem>
        )}

        {attributeKeys.map((key) => (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger className="text-sm font-semibold capitalize">{key}</AccordionTrigger>
            <AccordionContent>
              <CheckList name={key} values={facets.attributes[key]} selected={attributes[key] ?? []} onToggle={(v) => toggleAttribute(key, v)} />
            </AccordionContent>
          </AccordionItem>
        ))}

        <AccordionItem value="rating">
          <AccordionTrigger className="text-sm font-semibold">Customer rating</AccordionTrigger>
          <AccordionContent>
            <RatingFilter value={params.rating ?? undefined} onChange={(v) => update({ rating: v })} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
