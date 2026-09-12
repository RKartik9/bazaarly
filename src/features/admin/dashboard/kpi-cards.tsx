import { ArrowDownRight, ArrowUpRight, IndianRupee, PackageSearch, ShoppingCart, Users } from "lucide-react";
import { Counter } from "@/components/motion/counter";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { cn } from "@/lib/utils";
import type { DashboardKpis } from "./queries";

function delta(current: number, previous: number) {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function KpiCards({ kpis }: { kpis: DashboardKpis }) {
  const cards = [
    {
      label: "Revenue (30d)",
      value: kpis.revenue30d,
      format: "currency" as const,
      delta: delta(kpis.revenue30d, kpis.revenuePrev30d),
      icon: IndianRupee,
      tint: "bg-mint text-teal",
    },
    {
      label: "Orders (30d)",
      value: kpis.orders30d,
      delta: delta(kpis.orders30d, kpis.ordersPrev30d),
      icon: ShoppingCart,
      tint: "bg-sky text-foreground",
      hint: `${kpis.pendingFulfilment} awaiting fulfilment`,
    },
    {
      label: "Avg. order value",
      value: kpis.aov30d,
      format: "currency" as const,
      icon: ArrowUpRight,
      tint: "bg-lavender text-foreground",
    },
    {
      label: "Low stock SKUs",
      value: kpis.lowStockCount,
      icon: PackageSearch,
      tint: kpis.lowStockCount ? "bg-blush text-primary" : "bg-muted text-muted-foreground",
      hint: `${kpis.customers} customers`,
      hintIcon: Users,
    },
  ];

  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" stagger={0.06}>
      {cards.map((c) => (
        <StaggerItem key={c.label}>
          <div className="rounded-3xl bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
              <span className={cn("grid size-9 place-items-center rounded-xl", c.tint)}>
                <c.icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 font-heading text-3xl font-extrabold tabular-nums">
              <Counter value={c.value} format={c.format} />
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              {c.delta != null && (
                <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold", c.delta >= 0 ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive")}>
                  {c.delta >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {Math.abs(c.delta)}%
                </span>
              )}
              {c.delta != null && <span className="text-muted-foreground">vs previous 30d</span>}
              {c.hint && <span className="text-muted-foreground">{c.hint}</span>}
            </div>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
