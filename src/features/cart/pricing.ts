import { roundMoney } from "@/lib/money";
import { siteConfig } from "@/lib/site";
import type { CartLine, CartTotals } from "./types";

export type ShippingChoice = "standard" | "express";

export function shippingFee(subtotalAfterDiscount: number, freeShipping: boolean, choice: ShippingChoice = "standard") {
  if (choice === "express") return siteConfig.expressShippingFee;
  if (freeShipping) return 0;
  return subtotalAfterDiscount >= siteConfig.freeShippingThreshold ? 0 : siteConfig.standardShippingFee;
}

export function computeTotals(
  lines: CartLine[],
  couponDiscount = 0,
  freeShipping = false,
  choice: ShippingChoice = "standard",
  codFee = 0,
): CartTotals {
  const active = lines.filter((l) => !l.savedForLater);
  const subtotal = roundMoney(active.reduce((s, l) => s + l.price * l.qty, 0));
  const mrpTotal = roundMoney(active.reduce((s, l) => s + l.mrp * l.qty, 0));
  const discount = roundMoney(Math.max(0, mrpTotal - subtotal));
  const afterCoupon = Math.max(0, subtotal - couponDiscount);
  const shipping = active.length ? shippingFee(afterCoupon, freeShipping, choice) : 0;
  const total = roundMoney(afterCoupon + shipping + codFee);
  const itemCount = active.reduce((s, l) => s + l.qty, 0);
  const freeShippingRemaining = Math.max(0, siteConfig.freeShippingThreshold - afterCoupon);

  return { subtotal, mrpTotal, discount, couponDiscount, shipping, total, itemCount, freeShippingRemaining };
}
