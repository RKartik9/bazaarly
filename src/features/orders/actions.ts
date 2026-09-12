"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Order } from "@/lib/db/models";
import { AppError, NotFoundError } from "@/lib/errors";
import { authAction } from "@/lib/safe-action";
import { safeText } from "@/lib/validation";
import { orderLines, releaseStock, restock } from "./inventory";
import { CANCELLABLE, RETURNABLE } from "./types";

const orderNumber = z.string().regex(/^BZ[A-Z0-9]{11}$/, "Invalid order number");

const reasonSchema = z.object({
  orderNumber,
  reason: safeText(300).pipe(z.string().min(3, "Tell us why (a few words is fine)")),
});

export const cancelOrderAction = authAction
  .metadata({ name: "orders.cancel", limit: "action" })
  .inputSchema(reasonSchema)
  .action(async ({ parsedInput, ctx }) => {
    const order = await Order.findOne({ userId: ctx.user.id, orderNumber: parsedInput.orderNumber });
    if (!order) throw new NotFoundError("Order");
    if (!CANCELLABLE.includes(order.status)) throw new AppError("This order can no longer be cancelled.");

    if (order.status === "pending") {
      if (!order.stockReleased) await releaseStock(orderLines(order));
    } else {
      await restock(orderLines(order));
    }
    order.stockReleased = true;
    order.status = "cancelled";
    order.cancelReason = parsedInput.reason;
    if (order.payment.status === "paid") order.payment.status = "refunded";
    order.timeline.push({ status: "cancelled", note: `Cancelled by customer: ${parsedInput.reason}`, at: new Date() });
    await order.save();

    revalidatePath(`/account/orders/${order.orderNumber}`);
    revalidatePath("/account/orders");
    return { status: order.status };
  });

export const requestReturnAction = authAction
  .metadata({ name: "orders.requestReturn", limit: "action" })
  .inputSchema(reasonSchema)
  .action(async ({ parsedInput, ctx }) => {
    const order = await Order.findOne({ userId: ctx.user.id, orderNumber: parsedInput.orderNumber });
    if (!order) throw new NotFoundError("Order");
    if (!RETURNABLE.includes(order.status)) throw new AppError("Only delivered orders can be returned.");

    const delivered = order.timeline.find((t) => t.status === "delivered")?.at ?? order.updatedAt ?? new Date();
    const daysSince = (Date.now() - new Date(delivered).getTime()) / 86_400_000;
    if (daysSince > 7) throw new AppError("The 7-day return window for this order has closed.");

    order.status = "return_requested";
    order.returnReason = parsedInput.reason;
    order.timeline.push({ status: "return_requested", note: parsedInput.reason, at: new Date() });
    await order.save();

    revalidatePath(`/account/orders/${order.orderNumber}`);
    revalidatePath("/account/orders");
    return { status: order.status };
  });
