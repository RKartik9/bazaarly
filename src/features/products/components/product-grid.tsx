import type { ProductCardDto } from "@/features/catalog/types";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";

type Props = {
  products: ProductCardDto[];
  columns?: 3 | 4 | 5;
  className?: string;
  priorityCount?: number;
};

export function ProductGrid({ products, columns = 4, className, priorityCount = 4 }: Props) {
  return (
    <Stagger
      stagger={0.05}
      className={cn(
        "grid gap-x-4 gap-y-8 sm:gap-x-5",
        columns === 3 && "grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
        columns === 5 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5",
        className,
      )}
    >
      {products.map((p, i) => (
        <StaggerItem key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
