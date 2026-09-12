import Image from "next/image";
import Link from "next/link";
import { Banknote, CreditCard } from "lucide-react";
import { AddressCard } from "@/features/addresses/components/address-card";
import { formatPrice } from "@/lib/money";
import { formatDeliveryDate } from "@/lib/shipping";
import type { OrderDto } from "../types";
import { OrderActions } from "./order-actions";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderTimeline } from "./order-timeline";

const PAYMENT_LABEL = { pending: "Pending", paid: "Paid", failed: "Failed", refunded: "Refunded", cod_pending: "Pay on delivery" } as const;

export function OrderDetail({ order }: { order: OrderDto }) {
  const placed = new Date(order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });
  const showEta = order.expectedDelivery && !["delivered", "cancelled", "returned", "return_requested"].includes(order.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-extrabold tabular-nums sm:text-3xl">#{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Placed on {placed}</p>
          {showEta && <p className="mt-1 text-sm font-medium text-success">Arriving by {formatDeliveryDate(new Date(order.expectedDelivery!))}</p>}
        </div>
        <OrderActions orderNumber={order.orderNumber} status={order.status} />
      </div>

      <section className="rounded-3xl bg-card p-5 shadow-soft sm:p-6">
        <OrderTimeline status={order.status} timeline={order.timeline} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-3xl bg-card p-5 shadow-soft">
          <h2 className="font-heading text-lg font-bold">Items</h2>
          <ul className="mt-4 divide-y">
            {order.items.map((item) => (
              <li key={item.sku} className="flex gap-4 py-4">
                <Link href={`/p/${item.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {item.image && <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.brand}</p>
                  <Link href={`/p/${item.slug}`} className="line-clamp-2 text-sm font-medium hover:underline">
                    {item.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                    {Object.keys(item.attributes).length > 0 && " · "}Qty {item.qty}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{formatPrice(item.price * item.qty)}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl bg-card p-5 shadow-soft">
            <h2 className="font-heading text-lg font-bold">Payment</h2>
            <div className="mt-3 flex items-center gap-3 text-sm">
              {order.payment.method === "cod" ? <Banknote className="size-4 text-teal" /> : <CreditCard className="size-4 text-teal" />}
              <span>{order.payment.method === "cod" ? "Cash on delivery" : "Razorpay"}</span>
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{PAYMENT_LABEL[order.payment.status]}</span>
            </div>
            <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
              <Row label="Items" value={formatPrice(order.pricing.subtotal)} />
              {order.pricing.discount > 0 && <Row label={`Coupon${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`− ${formatPrice(order.pricing.discount)}`} tone="success" />}
              <Row label={`Delivery (${order.delivery})`} value={order.pricing.shipping === 0 ? "Free" : formatPrice(order.pricing.shipping)} />
              {order.pricing.codFee > 0 && <Row label="COD fee" value={formatPrice(order.pricing.codFee)} />}
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd className="font-heading tabular-nums">{formatPrice(order.pricing.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl bg-card p-5 shadow-soft">
            <h2 className="mb-3 font-heading text-lg font-bold">Delivery address</h2>
            <AddressCard address={order.address} className="border-0 bg-muted/40" />
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={tone === "success" ? "font-medium text-success tabular-nums" : "font-medium tabular-nums"}>{value}</dd>
    </div>
  );
}
