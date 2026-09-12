"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function remaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    h: Math.floor(diff / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
    done: diff === 0,
  };
}

export function Countdown({ until, className, compact }: { until: string; className?: string; compact?: boolean }) {
  const target = new Date(until).getTime();
  const [t, setT] = useState(() => remaining(target));

  useEffect(() => {
    const id = setInterval(() => setT(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (t.done) return <span className={cn("text-xs text-muted-foreground", className)}>Deal ended</span>;

  const cells = [
    { label: "hrs", value: t.h },
    { label: "min", value: t.m },
    { label: "sec", value: t.s },
  ];

  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-live="off">
      {cells.map((c, i) => (
        <div key={c.label} className="flex items-center gap-1.5">
          <div className={cn("flex flex-col items-center rounded-lg bg-ink text-background", compact ? "min-w-8 px-1 py-0.5" : "min-w-11 px-1.5 py-1")}>
            <span className={cn("font-heading font-bold tabular-nums", compact ? "text-xs" : "text-lg leading-none")}>{String(c.value).padStart(2, "0")}</span>
            {!compact && <span className="text-[9px] uppercase tracking-wider text-background/60">{c.label}</span>}
          </div>
          {i < cells.length - 1 && <span className="font-bold text-muted-foreground">:</span>}
        </div>
      ))}
    </div>
  );
}
