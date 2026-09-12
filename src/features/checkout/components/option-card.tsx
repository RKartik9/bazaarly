"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  trailing?: React.ReactNode;
  badge?: string;
};

export function OptionCard({ selected, disabled, onSelect, icon, title, description, trailing, badge }: Props) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.99 }}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left transition",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border/70 hover:border-primary/40",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", selected ? "bg-primary text-primary-foreground" : "bg-muted")}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{title}</span>
          {badge && <span className="rounded-full bg-saffron px-2 py-0.5 text-[11px] font-bold text-saffron-foreground">{badge}</span>}
        </span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
      </span>
      {trailing && <span className="shrink-0 text-right text-sm font-semibold tabular-nums">{trailing}</span>}
      <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2", selected ? "border-primary" : "border-border")}>
        {selected && <span className="size-2.5 rounded-full bg-primary" />}
      </span>
    </motion.button>
  );
}
