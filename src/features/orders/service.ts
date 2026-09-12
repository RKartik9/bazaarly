import "server-only";
import { after } from "next/server";
import { Coupon, Order, type DeliveryOption, type OrderDoc, type PaymentMethod } from "@/lib/db/models";
import { estimateDelivery, deliveryDate } from "@/lib/shipping";
import { siteConfig } from "@/lib/site";
import type { CartDto } from "@/features/cart/types";
import { computeTotals } from "@/features/cart/pricing";
import type { AddressDto } from "@/features/addresses/types";
import { sendOrderConfirmation } from "@/lib/email/send-order-confirmation";
import { commitStock, orderLines, releaseStock } from "./inventory";

export function generateOrderNumber() {
  const now = new Date();
  const stamp = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `BZ${stamp}${rand}`;
}

type BuildInput = {
  userId: string;
  cart: CartDto;
  address: AddressDto;
  delivery: DeliveryOption;
  payment: PaymentMethod;
};

export function buildOrderDocument({ userId, cart, address, delivery, payment }: BuildInput) {
  const codFee = payment === "cod" ? siteConfig.codFee : 0;
  const totals = computeTotals(cart.lines, cart.coupon?.discount ?? 0, cart.coupon?.freeShipping ?? false, delivery, codFee);
  const estimate = estimateDelivery(address.pincode);
  const days = delivery === "express" && estimate.expressAvailable ? 1 : estimate.standardDays;
  const { id: _id, isDefault: _isDefault, ...snapshot } = address;

  return {
    orderNumber: generateOrderNumber(),
    userId,
    items: cart.lines.map((l) => ({
      product: l.productId,
      slug: l.slug,
      title: l.title,
      brand: l.brand,
      image: l.image,
      sku: l.sku,
      attributes: l.attributes,
      price: l.price,
      mrp: l.mrp,
      qty: l.qty,
    })),
    address: snapshot,
    pricing: {
      subtotal: totals.subtotal,
      discount: totals.couponDiscount,
      shipping: totals.shipping,
      codFee,
      tax: 0,
      total: totals.total,
    },
    couponCode: cart.coupon?.code ?? null,
    delivery,
    payment: { method: payment, status: payment === "cod" ? ("cod_pending" as const) : ("pending" as const) },
    status: "pending" as const,
    timeline: [{ status: "pending" as const, note: payment === "cod" ? "Order placed" : "Awaiting payment", at: new Date() }],
    expectedDelivery: deliveryDate(days),
  };
}

export async function confirmOrder(order: OrderDoc & { save(): Promise<unknown> }, note: string) {
  if (order.status !== "pending") return order;
  await commitStock(orderLines(order));
  if (order.couponCode) await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: 1 } });
  order.status = "confirmed";
  order.timeline.push({ status: "confirmed", note, at: new Date() });
  await order.save();
  after(() => sendOrderConfirmation(order));
  return order;
}

export async function failOrder(order: OrderDoc & { save(): Promise<unknown> }, reason: string) {
  if (order.status !== "pending") return order;
  if (!order.stockReleased) {
    await releaseStock(orderLines(order));
    order.stockReleased = true;
  }
  order.payment.status = "failed";
  order.payment.failureReason = reason;
  order.status = "cancelled";
  order.cancelReason = reason;
  order.timeline.push({ status: "cancelled", note: reason, at: new Date() });
  await order.save();
  return order;
}

export async function findUserOrder(userId: string, orderNumber: string) {
  return Order.findOne({ userId, orderNumber });
}
