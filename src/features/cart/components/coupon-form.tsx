"use client";

import { useState, useTransition } from "react";
import { TicketPercent, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/money";
import type { CartCoupon } from "../types";
import { useCartMutations } from "../use-cart-mutations";

export function CouponForm({ coupon, error }: { coupon: CartCoupon; error: string | null }) {
  const { applyCoupon, removeCoupon } = useCartMutations();
  const [code, setCode] = useState("");
  const [pending, start] = useTransition();

  if (coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-success/30 bg-success/10 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <TicketPercent className="size-4 text-success" />
          <div>
            <p className="text-sm font-semibold">{coupon.code}</p>
            <p className="text-xs text-muted-foreground">
              {coupon.freeShipping ? "Free shipping applied" : `You save ${formatPrice(coupon.discount)}`}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => start(() => void removeCoupon())} className="rounded-full p-1.5 hover:bg-background" aria-label="Remove coupon">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!code.trim()) return;
        start(async () => {
          const ok = await applyCoupon(code);
          if (ok) setCode("");
        });
      }}
      className="space-y-1.5"
    >
      <div className="flex gap-2">
        <div className="relative flex-1">
          <TicketPercent className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Coupon code"
            className="h-10 w-full rounded-full border bg-card pl-9 pr-3 text-sm uppercase tracking-wider outline-none focus:border-primary/50"
            maxLength={20}
          />
        </div>
        <Button type="submit" variant="secondary" size="lg" className="rounded-full" disabled={pending || !code.trim()}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}
