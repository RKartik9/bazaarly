"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCatalogParams } from "./use-catalog-params";

function pageWindow(page: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const pages = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function CatalogPagination({ page, pageCount }: { page: number; pageCount: number }) {
  const { update } = useCatalogParams();
  if (pageCount <= 1) return null;

  const go = (p: number) => {
    update({ page: p }, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Previous page">
        <ChevronLeft className="size-4" />
      </Button>
      {pageWindow(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "size-8 rounded-full text-sm font-medium tabular-nums transition",
              p === page ? "bg-ink text-background" : "hover:bg-muted",
            )}
          >
            {p}
          </button>
        ),
      )}
      <Button variant="outline" size="icon-sm" disabled={page >= pageCount} onClick={() => go(page + 1)} aria-label="Next page">
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
