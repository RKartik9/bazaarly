"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RatingStars } from "@/components/ui/rating-stars";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { FacetValue } from "../types";

type CheckListProps = {
  name: string;
  values: FacetValue[];
  selected: string[];
  onToggle: (value: string) => void;
  limit?: number;
};

export function CheckList({ name, values, selected, onToggle, limit = 8 }: CheckListProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? values : values.slice(0, limit);

  return (
    <div className="space-y-2.5">
      {visible.map((v) => {
        const id = `${name}-${v.value}`;
        return (
          <div key={v.value} className="flex items-center gap-2.5">
            <Checkbox id={id} checked={selected.includes(v.value)} onCheckedChange={() => onToggle(v.value)} />
            <Label htmlFor={id} className="flex flex-1 cursor-pointer justify-between text-sm font-normal capitalize">
              <span className="truncate">{v.value}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{v.count}</span>
            </Label>
          </div>
        );
      })}
      {values.length > limit && (
        <button type="button" onClick={() => setExpanded((e) => !e)} className="text-xs font-semibold text-secondary hover:underline">
          {expanded ? "Show less" : `Show ${values.length - limit} more`}
        </button>
      )}
    </div>
  );
}

type PriceProps = {
  range: { min: number; max: number };
  value: { min?: number; max?: number };
  onCommit: (min: number | null, max: number | null) => void;
};

export function PriceRange({ range, value, onCommit }: PriceProps) {
  const lo = value.min ?? range.min;
  const hi = value.max ?? range.max;
  const [local, setLocal] = useState<[number, number]>([lo, hi]);
  const [seen, setSeen] = useState<[number, number]>([lo, hi]);

  if (seen[0] !== lo || seen[1] !== hi) {
    setSeen([lo, hi]);
    setLocal([lo, hi]);
  }

  if (range.max <= range.min) return <p className="text-sm text-muted-foreground">Single price point</p>;

  return (
    <div className="space-y-4">
      <Slider
        min={range.min}
        max={range.max}
        step={Math.max(1, Math.round((range.max - range.min) / 100))}
        value={local}
        onValueChange={(v) => setLocal([v[0], v[1]])}
        onValueCommit={(v) => onCommit(v[0] <= range.min ? null : v[0], v[1] >= range.max ? null : v[1])}
      />
      <div className="flex items-center justify-between text-sm font-medium tabular-nums">
        <span>{formatPrice(local[0])}</span>
        <span>{formatPrice(local[1])}</span>
      </div>
    </div>
  );
}

export function RatingFilter({ value, onChange }: { value?: number; onChange: (v: number | null) => void }) {
  return (
    <div className="space-y-1.5">
      {[4, 3, 2].map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(value === r ? null : r)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted",
            value === r && "bg-primary/10 font-semibold text-primary",
          )}
        >
          <RatingStars value={r} size="sm" showValue={false} />
          <span>&amp; up</span>
        </button>
      ))}
    </div>
  );
}

export function ToggleRow({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
