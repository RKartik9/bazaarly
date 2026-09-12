"use client";

import { Minus, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  max?: number;
  min?: number;
  pending?: boolean;
  onChange: (next: number) => void;
  size?: "sm" | "md";
};

export function QuantityStepper({ value, max = 10, min = 1, pending, onChange, size = "md" }: Props) {
  const btn = cn(
    "flex items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent",
    size === "sm" ? "size-7" : "size-9",
  );
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border bg-card",
        size === "sm" ? "h-8 gap-0.5 px-0.5" : "h-11 gap-1 px-1",
      )}
    >
      <button type="button" className={btn} disabled={pending || value <= min} onClick={() => onChange(value - 1)} aria-label="Decrease quantity">
        <Minus className="size-3.5" />
      </button>
      <span className={cn("min-w-6 text-center font-semibold tabular-nums", size === "sm" ? "text-xs" : "text-sm")}>
        {pending ? <Loader2 className="mx-auto size-3.5 animate-spin" /> : value}
      </span>
      <button type="button" className={btn} disabled={pending || value >= max} onClick={() => onChange(value + 1)} aria-label="Increase quantity">
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
