import Image from "next/image";
import Link from "next/link";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import type { OrderSummaryDto } from "@/features/orders/types";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { LowStockRow, TopProduct } from "./queries";

export function Panel({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl bg-card p-5 shadow-soft", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function RecentOrders({ orders }: { orders: OrderSummaryDto[] }) {
  if (!orders.length) return <p className="text-sm text-muted-foreground">No orders yet.</p>;
  return (
    <ul className="divide-y">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/admin/orders/${o.orderNumber}`} className="flex items-center gap-3 py-2.5 text-sm hover:bg-muted/40 -mx-2 px-2 rounded-xl">
            <span className="font-medium tabular-nums">#{o.orderNumber}</span>
            <OrderStatusBadge status={o.status} />
            <span className="ml-auto text-muted-foreground">{o.itemCount} items</span>
            <span className="font-semibold tabular-nums">{formatPrice(o.total)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function TopProducts({ products }: { products: TopProduct[] }) {
  if (!products.length) return <p className="text-sm text-muted-foreground">No sales yet.</p>;
  const max = products[0]?.revenue ?? 1;
  return (
    <ul className="space-y-3">
      {products.map((p) => (
        <li key={p.slug} className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
            {p.image && <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-2 text-sm">
              <Link href={`/p/${p.slug}`} className="truncate font-medium hover:underline">
                {p.title}
              </Link>
              <span className="shrink-0 font-semibold tabular-nums">{formatPrice(p.revenue)}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-teal" style={{ width: `${Math.max(6, (p.revenue / max) * 100)}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function LowStockList({ rows }: { rows: LowStockRow[] }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">All SKUs are healthy.</p>;
  return (
    <ul className="divide-y text-sm">
      {rows.map((r) => (
        <li key={r.sku} className="flex items-center gap-3 py-2">
          <Link href={`/admin/products/${r.productId}`} className="min-w-0 flex-1 truncate font-medium hover:underline">
            {r.title}
          </Link>
          <span className="text-xs text-muted-foreground tabular-nums">{r.sku}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold tabular-nums", r.stock === 0 ? "bg-destructive/10 text-destructive" : "bg-butter")}>{r.stock} left</span>
        </li>
      ))}
    </ul>
  );
}
