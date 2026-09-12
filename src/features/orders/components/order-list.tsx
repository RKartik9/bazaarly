import Image from "next/image";
import Link from "next/link";
import { ChevronRight, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { formatPrice } from "@/lib/money";
import { formatDeliveryDate } from "@/lib/shipping";
import type { OrderSummaryDto } from "../types";
import { OrderStatusBadge } from "./order-status-badge";

export function OrderList({ orders }: { orders: OrderSummaryDto[] }) {
  if (!orders.length) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed bg-card/60 px-6 py-20 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-butter text-foreground">
          <PackageOpen className="size-8" />
        </div>
        <h2 className="mt-5 font-heading text-2xl font-bold">No orders yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">When you place an order it will show up here with live tracking.</p>
        <Button asChild className="mt-6 rounded-full" size="lg">
          <Link href="/deals">Browse deals</Link>
        </Button>
      </div>
    );
  }

  return (
    <Stagger className="space-y-3" stagger={0.04}>
      {orders.map((order) => (
        <StaggerItem key={order.id}>
          <Link
            href={`/account/orders/${order.orderNumber}`}
            className="group flex items-center gap-4 rounded-2xl bg-card p-4 shadow-soft transition hover:shadow-lift"
          >
            <div className="flex -space-x-3">
              {order.preview.map((item, i) => (
                <div key={i} className="relative size-14 overflow-hidden rounded-xl border-2 border-card bg-muted">
                  {item.image && <Image src={item.image} alt={item.title} fill sizes="56px" className="object-cover" />}
                </div>
              ))}
              {order.itemCount > order.preview.length && (
                <div className="grid size-14 place-items-center rounded-xl border-2 border-card bg-muted text-xs font-bold">
                  +{order.itemCount - order.preview.length}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold tabular-nums">#{order.orderNumber}</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{order.preview.map((p) => p.title).join(", ")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                {order.expectedDelivery && !["delivered", "cancelled", "returned"].includes(order.status) && (
                  <> · Arriving by {formatDeliveryDate(new Date(order.expectedDelivery))}</>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="font-heading text-lg font-bold tabular-nums">{formatPrice(order.total)}</p>
              <p className="text-xs text-muted-foreground">{order.itemCount} {order.itemCount === 1 ? "item" : "items"}</p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
