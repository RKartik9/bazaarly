"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductCardDto } from "@/features/catalog/types";
import { ProductCard } from "./product-card";

export function ProductRail({ products }: { products: ProductCardDto[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className="relative">
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {products.map((p) => (
          <div key={p.id} className="w-[44vw] shrink-0 snap-start sm:w-56 lg:w-64">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <div className="absolute -top-14 right-0 hidden gap-2 sm:flex">
        <Button variant="outline" size="icon-lg" className="rounded-full" onClick={() => scrollBy(-1)} aria-label="Scroll left">
          <ChevronLeft className="size-5" />
        </Button>
        <Button variant="outline" size="icon-lg" className="rounded-full" onClick={() => scrollBy(1)} aria-label="Scroll right">
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}
