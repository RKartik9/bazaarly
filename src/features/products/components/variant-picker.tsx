"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Option = { value: string; available: boolean; exists: boolean; image: string };

type Props = {
  axis: string;
  options: Option[];
  value?: string;
  onSelect: (value: string) => void;
};

const COLOR_MAP: Record<string, string> = {
  black: "#111", white: "#f7f7f7", red: "#d62828", blue: "#2563eb", navy: "#1e3a8a", green: "#15803d",
  olive: "#6b7f3a", grey: "#9ca3af", gray: "#9ca3af", silver: "#c0c0c0", gold: "#d4a017", pink: "#ec4899",
  beige: "#d9c3a5", brown: "#7c4a1e", tan: "#c99a6b", maroon: "#7f1d1d", purple: "#7e22ce", yellow: "#facc15",
  orange: "#f97316", teal: "#0f766e", cream: "#f5efe0", charcoal: "#374151", mint: "#a7f3d0", lavender: "#c4b5fd",
  rust: "#b7410e", sand: "#e0c9a6", "midnight blue": "#191970", "forest green": "#228b22",
};

function swatchColor(value: string) {
  const key = value.toLowerCase();
  return COLOR_MAP[key] ?? COLOR_MAP[key.split(" ").at(-1) ?? ""] ?? null;
}

export function VariantPicker({ axis, options, value, onSelect }: Props) {
  const isColor = axis === "color" || axis === "colour";

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-sm font-semibold capitalize">{axis}</p>
        {value && <p className="text-sm capitalize text-muted-foreground">{value}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          const swatch = isColor ? swatchColor(opt.value) : null;
          return (
            <motion.button
              key={opt.value}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => onSelect(opt.value)}
              aria-pressed={active}
              title={opt.value}
              className={cn(
                "relative flex min-w-11 items-center justify-center rounded-full border-2 text-sm font-medium capitalize transition",
                swatch ? "size-10 p-0" : "h-10 px-4",
                active ? "border-ink" : "border-border hover:border-ink/40",
                !opt.available && "text-muted-foreground",
              )}
            >
              {swatch ? (
                <span className="size-7 rounded-full border border-black/10" style={{ background: swatch }} />
              ) : (
                opt.value
              )}
              {!opt.available && (
                <span className="pointer-events-none absolute inset-x-1 top-1/2 h-px -rotate-12 bg-muted-foreground/60" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
