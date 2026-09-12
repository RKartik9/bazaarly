import "server-only";
import { Coupon, Order, type CouponDoc } from "@/lib/db/models";
import { roundMoney } from "@/lib/money";

export type CouponOutcome =
  | { ok: true; coupon: CouponDoc; discount: number; freeShipping: boolean }
  | { ok: false; reason: string };

export async function evaluateCoupon(code: string, subtotal: number, userId?: string | null): Promise<CouponOutcome> {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true }).lean();
  if (!coupon) return { ok: false, reason: "That coupon code isn't valid." };

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, reason: "This coupon isn't active yet." };
  if (coupon.expiresAt && coupon.expiresAt < now) return { ok: false, reason: "This coupon has expired." };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, reason: "This coupon has been fully redeemed." };
  }
  if (subtotal < coupon.minOrder) {
    return { ok: false, reason: `Add items worth ₹${coupon.minOrder - subtotal} more to use ${coupon.code}.` };
  }
  if (userId && coupon.perUserLimit) {
    const used = await Order.countDocuments({
      userId,
      couponCode: coupon.code,
      status: { $nin: ["cancelled"] },
    });
    if (used >= coupon.perUserLimit) return { ok: false, reason: "You've already used this coupon." };
  }

  let discount = 0;
  let freeShipping = false;
  if (coupon.type === "percent") {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.type === "flat") {
    discount = Math.min(coupon.value, subtotal);
  } else {
    freeShipping = true;
  }

  return { ok: true, coupon, discount: roundMoney(discount), freeShipping };
}
