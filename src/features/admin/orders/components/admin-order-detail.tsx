import Image from "next/image";
import Link from "next/link";
import { Banknote, CreditCard, Mail, Phone } from "lucide-react";
import { AddressCard } from "@/features/addresses/components/address-card";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { OrderTimeline } from "@/features/orders/components/order-timeline";
import { formatPrice } from "@/lib/money";
import type { AdminOrderDetail } from "../queries";
import { OrderStatusPanel } from "./order-status-panel";

const PAYMENT_LABEL = { pending: "Pending", paid: "Paid", failed: "Failed", refunded: "Refunded", cod_pending: "Pay on delivery" } as const;

export function AdminOrderDetailView({ order }: { order: AdminOrderDetail }) {
  const placed = new Date(order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-extrabold tabular-nums sm:text-3xl">#{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Placed on {placed}</p>
        </div>
        <Link href="/admin/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          ← All orders
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-3xl bg-card p-5 shadow-soft sm:p-6">
            <OrderTimeline status={order.status} timeline={order.timeline} />
          </section>

          <section className="rounded-3xl bg-card p-5 shadow-soft">
            <h2 className="font-heading text-lg font-bold">Items</h2>
            <ul className="mt-4 divide-y">
              {order.items.map((item) => (
                <li key={item.sku} className="flex gap-4 py-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">{item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}</div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/products/${item.productId}`} className="line-clamp-2 text-sm font-medium hover:underline">
                      {item.title}
                    </Link>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">{item.sku}</p>
                    <p className="text-xs text-muted-foreground">
                      {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                      {Object.keys(item.attributes).length > 0 && " · "}
                      {formatPrice(item.price)} × {item.qty}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{formatPrice(item.price * item.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-2 border-t pt-4 text-sm">
              <Row label="Items" value={formatPrice(order.pricing.subtotal)} />
              {order.pricing.discount > 0 && <Row label={`Coupon${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`− ${formatPrice(order.pricing.discount)}`} />}
              <Row label={`Delivery (${order.delivery})`} value={order.pricing.shipping === 0 ? "Free" : formatPrice(order.pricing.shipping)} />
              {order.pricing.codFee > 0 && <Row label="COD fee" value={formatPrice(order.pricing.codFee)} />}
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd className="font-heading tabular-nums">{formatPrice(order.pricing.total)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          <OrderStatusPanel orderNumber={order.orderNumber} status={order.status} paid={order.payment.status === "paid"} />

          <section className="rounded-3xl bg-card p-5 shadow-soft">
            <h2 className="font-heading text-lg font-bold">Customer</h2>
            {order.customer ? (
              <div className="mt-3 space-y-1.5 text-sm">
                <Link href={`/admin/customers?q=${encodeURIComponent(order.customer.email)}`} className="font-medium hover:underline">
                  {order.customer.name || order.address.fullName}
                </Link>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5" /> {order.customer.email}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-3.5" /> {order.address.phone}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Customer record not found.</p>
            )}
          </section>

          <section className="rounded-3xl bg-card p-5 shadow-soft">
            <h2 className="font-heading text-lg font-bold">Payment</h2>
            <div className="mt-3 flex items-center gap-3 text-sm">
              {order.payment.method === "cod" ? <Banknote className="size-4 text-teal" /> : <CreditCard className="size-4 text-teal" />}
              <span>{order.payment.method === "cod" ? "Cash on delivery" : "Razorpay"}</span>
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{PAYMENT_LABEL[order.payment.status]}</span>
            </div>
            {order.payment.razorpayPaymentId && <p className="mt-2 font-mono text-xs text-muted-foreground">{order.payment.razorpayPaymentId}</p>}
            {order.payment.paidAt && <p className="mt-1 text-xs text-muted-foreground">Paid {new Date(order.payment.paidAt).toLocaleString("en-IN")}</p>}
          </section>

          <section className="rounded-3xl bg-card p-5 shadow-soft">
            <h2 className="mb-3 font-heading text-lg font-bold">Ship to</h2>
            <AddressCard address={order.address} className="border-0 bg-muted/40" />
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
