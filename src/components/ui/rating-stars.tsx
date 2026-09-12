import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  count?: number;
  size?: "xs" | "sm" | "md";
  showValue?: boolean;
  className?: string;
};

export function RatingStars({ value, count, size = "sm", showValue = true, className }: Props) {
  const dim = size === "xs" ? "size-3" : size === "sm" ? "size-3.5" : "size-4.5";
  const text = size === "xs" ? "text-[11px]" : size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)} aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      <div className="relative inline-flex">
        <div className="flex gap-0.5 text-muted-foreground/30">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn(dim, "fill-current")} />
          ))}
        </div>
        <div className="absolute inset-0 flex gap-0.5 overflow-hidden text-saffron" style={{ width: `${(Math.min(5, Math.max(0, value)) / 5) * 100}%` }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn(dim, "shrink-0 fill-current")} />
          ))}
        </div>
      </div>
      {showValue && (
        <span className={cn(text, "font-medium tabular-nums")}>
          {value.toFixed(1)}
          {count != null && <span className="text-muted-foreground"> ({count.toLocaleString("en-IN")})</span>}
        </span>
      )}
    </div>
  );
}
