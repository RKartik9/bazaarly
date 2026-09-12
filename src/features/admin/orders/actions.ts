"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/lib/db/enums";
import { Order, type OrderDoc } from "@/lib/db/models";
import { AppError, NotFoundError } from "@/lib/errors";
import { refundPayment } from "@/lib/razorpay";
import { adminAction } from "@/lib/safe-action";
import { orderLines, releaseStock, restock } from "@/features/orders/inventory";
import { confirmOrder } from "@/features/orders/service";
import { noteSchema, transitionSchema } from "./schemas";
import { canTransition } from "./transitions";

type OrderModel = OrderDoc & { save(): Promise<unknown> };

function revalidateOrder(orderNumber: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath("/admin");
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderNumber}`);
}

async function refundIfPaid(order: OrderModel, reason: string) {
  if (order.payment.status !== "paid") return "";
  if (order.payment.method === "razorpay" && order.payment.razorpayPaymentId) {
    try {
      const refund = await refundPayment(order.payment.razorpayPaymentId, order.pricing.total, { orderNumber: order.orderNumber, reason });
      order.payment.status = "refunded";
      return ` Refund ${refund.id} initiated.`;
    } catch (error) {
      console.error("[admin.orders.refund]", error);
      throw new AppError("Razorpay refund failed. Try again or refund from the Razorpay dashboard.");
    }
  }
  order.payment.status = "refunded";
  return " Marked as refunded.";
}

async function applyTransition(order: OrderModel, status: OrderStatus, note: string, actor: string) {
  const by = `by ${actor}`;
  switch (status) {
    case "confirmed": {
      if (order.status === "pending") {
        await confirmOrder(order, note || `Payment confirmed manually ${by}`);
        return;
      }
      break;
    }
    case "cancelled": {
      if (order.status === "pending") {
        if (!order.stockReleased) await releaseStock(orderLines(order));
      } else if (!order.stockReleased) {
        await restock(orderLines(order));
      }
      order.stockReleased = true;
      order.cancelReason = note || "Cancelled by store";
      note = `${note || "Cancelled by store"}${await refundIfPaid(order, "cancelled")}`;
      break;
    }
    case "delivered": {
      if (order.payment.method === "cod" && order.payment.status === "cod_pending") {
        order.payment.status = "paid";
        order.payment.paidAt = new Date();
      }
      if (order.status === "return_requested") note = note || "Return request declined";
      break;
    }
    case "returned": {
      if (!order.stockReleased) await restock(orderLines(order));
      order.stockReleased = true;
      note = `${note || "Return received"}${await refundIfPaid(order, "returned")}`;
      break;
    }
    case "return_requested": {
      order.returnReason = note || "Opened by store";
      break;
    }
  }
  order.status = status;
  order.timeline.push({ status, note: note || `Updated ${by}`, at: new Date() });
  await order.save();
}

export const transitionOrderAction = adminAction
  .metadata({ name: "admin.orders.transition", limit: "admin" })
  .inputSchema(transitionSchema)
  .action(async ({ parsedInput: { orderNumber, status, note }, ctx }) => {
    const order = await Order.findOne({ orderNumber });
    if (!order) throw new NotFoundError("Order");
    if (!canTransition(order.status as OrderStatus, status)) throw new AppError(`Cannot move an order from “${order.status}” to “${status}”.`);
    await applyTransition(order as OrderModel, status, note, ctx.user.name || ctx.user.email);
    revalidateOrder(orderNumber);
    return { status: order.status };
  });

export const addOrderNoteAction = adminAction
  .metadata({ name: "admin.orders.note", limit: "admin" })
  .inputSchema(noteSchema)
  .action(async ({ parsedInput: { orderNumber, note }, ctx }) => {
    const order = await Order.findOne({ orderNumber });
    if (!order) throw new NotFoundError("Order");
    order.timeline.push({ status: order.status as OrderStatus, note: `${note} — ${ctx.user.name || ctx.user.email}`, at: new Date() });
    await order.save();
    revalidateOrder(orderNumber);
    return { ok: true };
  });
