"use server";

import { revalidatePath } from "next/cache";
import { getUserAddress } from "@/features/addresses/queries";
import { getCart } from "@/features/cart/queries";
import { findCart, removeItems } from "@/features/cart/service";
import { expireStaleReservations, releaseStock, reserveStock } from "@/features/orders/inventory";
import { buildOrderDocument, confirmOrder, failOrder, findUserOrder } from "@/features/orders/service";
import { Order } from "@/lib/db/models";
import { env, razorpayConfigured } from "@/lib/env";
import { AppError, NotFoundError } from "@/lib/errors";
import { createRazorpayOrder, verifyPaymentSignature } from "@/lib/razorpay";
import { authAction } from "@/lib/safe-action";
import { estimateDelivery } from "@/lib/shipping";
import { clearDraft, writeDraft } from "./draft";
import { paymentFailedSchema, placeOrderSchema, selectAddressSchema, selectDeliverySchema, selectPaymentSchema, verifyPaymentSchema } from "./schemas";

export const selectAddressAction = authAction
  .metadata({ name: "checkout.selectAddress", limit: "checkout" })
  .inputSchema(selectAddressSchema)
  .action(async ({ parsedInput, ctx }) => {
    const address = await getUserAddress(ctx.user.id, parsedInput.addressId);
    if (!address) throw new NotFoundError("Address");
    await writeDraft({ addressId: address.id });
    return { ok: true };
  });

export const selectDeliveryAction = authAction
  .metadata({ name: "checkout.selectDelivery", limit: "checkout" })
  .inputSchema(selectDeliverySchema)
  .action(async ({ parsedInput }) => {
    await writeDraft({ delivery: parsedInput.delivery });
    return { ok: true };
  });

export const selectPaymentAction = authAction
  .metadata({ name: "checkout.selectPayment", limit: "checkout" })
  .inputSchema(selectPaymentSchema)
  .action(async ({ parsedInput }) => {
    await writeDraft({ payment: parsedInput.payment });
    return { ok: true };
  });

async function clearPurchasedLines(userId: string) {
  const cart = await findCart({ userId });
  if (!cart) return;
  removeItems(cart, (item) => !item.savedForLater);
  cart.couponCode = null;
  await cart.save();
}

export const placeOrderAction = authAction
  .metadata({ name: "checkout.placeOrder", limit: "checkout" })
  .inputSchema(placeOrderSchema)
  .action(async ({ parsedInput, ctx }) => {
    await expireStaleReservations(ctx.user.id);

    const [cart, address] = await Promise.all([getCart(), getUserAddress(ctx.user.id, parsedInput.addressId)]);
    if (!address) throw new NotFoundError("Address");
    if (!cart.lines.length) throw new AppError("Your bag is empty.");
    if (cart.couponError) throw new AppError(`Coupon problem: ${cart.couponError}`);

    const unavailable = cart.lines.find((l) => l.stock < l.qty);
    if (unavailable) throw new AppError(`"${unavailable.title}" only has ${unavailable.stock} left. Please update your bag.`, 409);

    const estimate = estimateDelivery(address.pincode);
    if (parsedInput.payment === "cod" && !estimate.codAvailable) throw new AppError("Cash on delivery isn't available for this pincode.");
    if (parsedInput.payment === "razorpay" && !razorpayConfigured) throw new AppError("Online payments are not configured. Please choose cash on delivery.", 503);
    const delivery = parsedInput.delivery === "express" && !estimate.expressAvailable ? "standard" : parsedInput.delivery;

    const doc = buildOrderDocument({ userId: ctx.user.id, cart, address, delivery, payment: parsedInput.payment });
    const lines = doc.items.map((i) => ({ productId: i.product, sku: i.sku, qty: i.qty }));
    await reserveStock(lines);

    let order;
    try {
      order = await Order.create(doc);
    } catch (error) {
      await releaseStock(lines);
      throw error;
    }

    if (parsedInput.payment === "cod") {
      await confirmOrder(order, "Cash on delivery order confirmed");
      await clearPurchasedLines(ctx.user.id);
      await clearDraft();
      revalidatePath("/", "layout");
      return { kind: "cod" as const, orderNumber: order.orderNumber };
    }

    try {
      const rzp = await createRazorpayOrder({
        amount: order.pricing.total,
        receipt: order.orderNumber,
        notes: { orderNumber: order.orderNumber, userId: ctx.user.id },
      });
      order.payment.razorpayOrderId = rzp.id;
      await order.save();
      return {
        kind: "razorpay" as const,
        orderNumber: order.orderNumber,
        razorpayOrderId: rzp.id,
        amount: rzp.amount,
        currency: rzp.currency,
        keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        prefill: { name: address.fullName, email: ctx.user.email, contact: address.phone },
      };
    } catch (error) {
      await failOrder(order, "Could not start payment");
      throw error;
    }
  });

export const verifyPaymentAction = authAction
  .metadata({ name: "checkout.verifyPayment", limit: "checkout" })
  .inputSchema(verifyPaymentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const order = await findUserOrder(ctx.user.id, parsedInput.orderNumber);
    if (!order) throw new NotFoundError("Order");
    if (order.payment.razorpayOrderId !== parsedInput.razorpayOrderId) throw new AppError("Payment does not match this order.");
    if (order.status === "confirmed" && order.payment.status === "paid") return { orderNumber: order.orderNumber };

    const valid = verifyPaymentSignature({
      razorpayOrderId: parsedInput.razorpayOrderId,
      razorpayPaymentId: parsedInput.razorpayPaymentId,
      signature: parsedInput.razorpaySignature,
    });
    if (!valid) {
      await failOrder(order, "Payment signature verification failed");
      throw new AppError("We couldn't verify this payment. If money was deducted it will be refunded automatically.");
    }

    order.payment.status = "paid";
    order.payment.razorpayPaymentId = parsedInput.razorpayPaymentId;
    order.payment.razorpaySignature = parsedInput.razorpaySignature;
    order.payment.paidAt = new Date();
    await confirmOrder(order, "Payment received via Razorpay");
    await clearPurchasedLines(ctx.user.id);
    await clearDraft();
    revalidatePath("/", "layout");
    return { orderNumber: order.orderNumber };
  });

export const paymentFailedAction = authAction
  .metadata({ name: "checkout.paymentFailed", limit: "checkout" })
  .inputSchema(paymentFailedSchema)
  .action(async ({ parsedInput, ctx }) => {
    const order = await findUserOrder(ctx.user.id, parsedInput.orderNumber);
    if (!order) throw new NotFoundError("Order");
    if (order.status === "pending" && order.payment.status === "pending") {
      await failOrder(order, parsedInput.reason || "Payment cancelled");
    }
    return { ok: true };
  });
