import { RatingStars } from "@/components/ui/rating-stars";
import type { ReviewSummary as Summary } from "../types";

export function ReviewSummary({ summary }: { summary: Summary }) {
  const stars = [5, 4, 3, 2, 1] as const;

  return (
    <div className="rounded-3xl bg-card p-6 shadow-soft">
      <div className="flex items-end gap-3">
        <span className="font-heading text-6xl font-extrabold leading-none tabular-nums">{summary.avg.toFixed(1)}</span>
        <div className="pb-1">
          <RatingStars value={summary.avg} size="md" showValue={false} />
          <p className="mt-1 text-sm text-muted-foreground">{summary.count.toLocaleString("en-IN")} ratings</p>
        </div>
      </div>
      <ul className="mt-5 space-y-2">
        {stars.map((star) => {
          const n = summary.distribution[star];
          const pct = summary.count ? Math.round((n / summary.count) * 100) : 0;
          return (
            <li key={star} className="flex items-center gap-3 text-sm">
              <span className="w-6 font-medium tabular-nums">{star}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-saffron transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-9 text-right text-xs text-muted-foreground tabular-nums">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
