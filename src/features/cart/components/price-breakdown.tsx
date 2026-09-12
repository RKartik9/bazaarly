import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { CartTotals } from "../types";

type Props = {
  totals: CartTotals;
  codFee?: number;
  className?: string;
  compact?: boolean;
};

export function PriceBreakdown({ totals, codFee = 0, className, compact }: Props) {
  const rows: { label: string; value: string; tone?: "success" | "muted" }[] = [
    { label: `Price (${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"})`, value: formatPrice(totals.mrpTotal) },
  ];
  if (totals.discount > 0) rows.push({ label: "Discount", value: `− ${formatPrice(totals.discount)}`, tone: "success" });
  if (totals.couponDiscount > 0) rows.push({ label: "Coupon", value: `− ${formatPrice(totals.couponDiscount)}`, tone: "success" });
  rows.push({
    label: "Delivery",
    value: totals.shipping === 0 ? "Free" : formatPrice(totals.shipping),
    tone: totals.shipping === 0 ? "success" : undefined,
  });
  if (codFee > 0) rows.push({ label: "Cash on delivery fee", value: formatPrice(codFee) });

  return (
    <dl className={cn("space-y-2 text-sm", className)}>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between">
          <dt className="text-muted-foreground">{r.label}</dt>
          <dd className={cn("font-medium tabular-nums", r.tone === "success" && "text-success")}>{r.value}</dd>
        </div>
      ))}
      <div className={cn("flex items-center justify-between border-t pt-3", compact ? "text-base" : "text-lg")}>
        <dt className="font-semibold">Total</dt>
        <dd className="font-heading font-bold tabular-nums">{formatPrice(totals.total + codFee)}</dd>
      </div>
      {totals.discount + totals.couponDiscount > 0 && (
        <p className="rounded-xl bg-success/10 px-3 py-2 text-xs font-medium text-success">
          You save {formatPrice(totals.discount + totals.couponDiscount)} on this order
        </p>
      )}
    </dl>
  );
}
