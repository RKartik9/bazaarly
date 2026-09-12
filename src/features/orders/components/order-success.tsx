"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Check, Package } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";
import { emptyCart } from "@/features/cart/types";
import { formatPrice } from "@/lib/money";
import { formatDeliveryDate } from "@/lib/shipping";
import type { OrderDto } from "../types";

const CONFETTI = ["bg-primary", "bg-saffron", "bg-teal", "bg-blush", "bg-lavender", "bg-mint"];

export function OrderSuccess({ order }: { order: OrderDto }) {
  const { setCart } = useCart();
  useEffect(() => {
    setCart({ ...emptyCart });
    toast.dismiss();
  }, [setCart]);

  const eta = order.expectedDelivery ? formatDeliveryDate(new Date(order.expectedDelivery)) : null;

  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="relative mx-auto mb-6 size-28">
        {CONFETTI.map((c, i) => (
          <motion.span
            key={c}
            className={`absolute left-1/2 top-1/2 size-2.5 rounded-full ${c}`}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: Math.cos((i / CONFETTI.length) * Math.PI * 2) * 70,
              y: Math.sin((i / CONFETTI.length) * Math.PI * 2) * 70,
              opacity: [0, 1, 0],
              scale: [0, 1.4, 0.6],
            }}
            transition={{ duration: 1.2, delay: 0.25 + i * 0.03, ease: "easeOut" }}
          />
        ))}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="grid size-28 place-items-center rounded-full bg-success text-success-foreground shadow-glow"
        >
          <motion.span initial={{ pathLength: 0, opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Check className="size-14" strokeWidth={3} />
          </motion.span>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Order placed</p>
        <h1 className="mt-2 font-heading text-4xl font-extrabold sm:text-5xl">Thank you, {order.address.fullName.split(" ")[0]}!</h1>
        <p className="mt-3 text-muted-foreground">
          Order <span className="font-semibold text-foreground tabular-nums">#{order.orderNumber}</span> is{" "}
          {order.payment.method === "cod" ? "confirmed. Pay when it arrives." : "confirmed and paid."}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-8 grid gap-3 rounded-3xl bg-card p-5 text-left shadow-soft sm:grid-cols-3"
      >
        <Stat label="Items" value={`${order.items.reduce((s, i) => s + i.qty, 0)}`} />
        <Stat label={order.payment.method === "cod" ? "Pay on delivery" : "Paid"} value={formatPrice(order.pricing.total)} />
        <Stat label="Arriving by" value={eta ?? "Soon"} />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="xl" className="rounded-xl">
          <Link href={`/account/orders/${order.orderNumber}`}>
            <Package className="size-4" /> Track order
          </Link>
        </Button>
        <Button asChild size="xl" variant="outline" className="rounded-xl">
          <Link href="/">
            Continue shopping <ArrowRight className="size-4" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/50 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-xl font-bold">{value}</p>
    </div>
  );
}
