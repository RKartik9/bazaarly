"use client";

import Link from "next/link";
import { ArrowRight, Lock, ShoppingBag } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useCart } from "../cart-provider";
import { CartLineItem } from "./cart-line-item";
import { CouponForm } from "./coupon-form";
import { FreeShippingBar } from "./free-shipping-bar";
import { PriceBreakdown } from "./price-breakdown";
import { SavedForLater } from "./saved-for-later";

export function CartPageView() {
  const { cart } = useCart();
  const { lines, saved, totals } = cart;

  if (!lines.length && !saved.length) return <EmptyCart />;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        {lines.length ? (
          <section className="rounded-3xl bg-card p-4 shadow-soft sm:p-6">
            <FreeShippingBar remaining={totals.freeShippingRemaining} />
            <ul className="mt-4 divide-y">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <CartLineItem key={line.sku} line={line} />
                ))}
              </AnimatePresence>
            </ul>
          </section>
        ) : (
          <EmptyCart inline />
        )}
        <SavedForLater lines={saved} />
      </div>

      <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl bg-card p-5 shadow-soft">
          <h2 className="font-heading text-lg font-bold">Coupons</h2>
          <div className="mt-3">
            <CouponForm coupon={cart.coupon} error={cart.couponError} />
          </div>
        </div>
        <div className="rounded-3xl bg-card p-5 shadow-soft">
          <h2 className="font-heading text-lg font-bold">Price details</h2>
          <PriceBreakdown totals={totals} className="mt-4" />
          <Button asChild size="xl" className="mt-5 w-full rounded-xl" disabled={!lines.length}>
            <Link href="/checkout">
              Proceed to checkout <ArrowRight className="size-4" />
            </Link>
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3" /> Secure checkout powered by Razorpay
          </p>
        </div>
      </aside>
    </div>
  );
}

function EmptyCart({ inline = false }: { inline?: boolean }) {
  return (
    <div className={inline ? "rounded-3xl border border-dashed bg-card/60 p-10 text-center" : "flex flex-col items-center rounded-3xl bg-blush/50 px-6 py-20 text-center"}>
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-card text-primary shadow-soft">
        <ShoppingBag className="size-8" />
      </div>
      <h2 className="mt-5 font-heading text-2xl font-bold">Your bag is empty</h2>
      <p className="mt-1 text-sm text-muted-foreground">Looks like you haven&apos;t added anything yet.</p>
      <Button asChild size="lg" className="mt-6 rounded-full">
        <Link href="/deals">Shop today&apos;s deals</Link>
      </Button>
    </div>
  );
}
