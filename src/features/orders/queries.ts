import "server-only";
import { connectDb } from "@/lib/db/mongoose";
import { Order, type OrderDoc } from "@/lib/db/models";
import type { OrderDto, OrderSummaryDto } from "./types";

type LeanOrder = OrderDoc & { createdAt: Date; updatedAt: Date };

export function toOrderDto(doc: LeanOrder): OrderDto {
  return {
    id: doc._id.toString(),
    orderNumber: doc.orderNumber,
    items: doc.items.map((i) => ({
      productId: i.product.toString(),
      slug: i.slug,
      title: i.title,
      brand: i.brand ?? "",
      image: i.image ?? "",
      sku: i.sku,
      attributes: i.attributes ?? {},
      price: i.price,
      mrp: i.mrp,
      qty: i.qty,
    })),
    address: {
      fullName: doc.address.fullName,
      phone: doc.address.phone,
      line1: doc.address.line1,
      line2: doc.address.line2 ?? "",
      landmark: doc.address.landmark ?? "",
      city: doc.address.city,
      state: doc.address.state,
      pincode: doc.address.pincode,
      country: doc.address.country ?? "India",
      type: doc.address.type ?? "home",
    },
    pricing: {
      subtotal: doc.pricing.subtotal,
      discount: doc.pricing.discount ?? 0,
      shipping: doc.pricing.shipping ?? 0,
      codFee: doc.pricing.codFee ?? 0,
      tax: doc.pricing.tax ?? 0,
      total: doc.pricing.total,
    },
    couponCode: doc.couponCode ?? null,
    delivery: doc.delivery ?? "standard",
    payment: {
      method: doc.payment.method,
      status: doc.payment.status ?? "pending",
      razorpayPaymentId: doc.payment.razorpayPaymentId ?? null,
      paidAt: doc.payment.paidAt ? doc.payment.paidAt.toISOString() : null,
    },
    status: doc.status ?? "pending",
    timeline: (doc.timeline ?? []).map((t) => ({ status: t.status, note: t.note ?? "", at: new Date(t.at).toISOString() })),
    cancelReason: doc.cancelReason ?? null,
    returnReason: doc.returnReason ?? null,
    expectedDelivery: doc.expectedDelivery ? doc.expectedDelivery.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toOrderSummary(doc: LeanOrder): OrderSummaryDto {
  return {
    id: doc._id.toString(),
    orderNumber: doc.orderNumber,
    status: doc.status ?? "pending",
    createdAt: doc.createdAt.toISOString(),
    expectedDelivery: doc.expectedDelivery ? doc.expectedDelivery.toISOString() : null,
    total: doc.pricing.total,
    itemCount: doc.items.reduce((s, i) => s + i.qty, 0),
    preview: doc.items.slice(0, 3).map((i) => ({ title: i.title, image: i.image ?? "" })),
    paymentMethod: doc.payment.method,
  };
}

export async function getUserOrder(userId: string, orderNumber: string): Promise<OrderDto | null> {
  await connectDb();
  const doc = await Order.findOne({ userId, orderNumber }).lean<LeanOrder>();
  return doc ? toOrderDto(doc) : null;
}

export async function getUserOrders(userId: string, limit = 50): Promise<OrderSummaryDto[]> {
  await connectDb();
  const docs = await Order.find({ userId, status: { $ne: "pending" } }).sort({ createdAt: -1 }).limit(limit).lean<LeanOrder[]>();
  return docs.map(toOrderSummary);
}
