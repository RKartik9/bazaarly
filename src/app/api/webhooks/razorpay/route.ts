import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { expireStaleReservations } from "@/features/orders/inventory";
import { confirmOrder, failOrder } from "@/features/orders/service";
import { connectDb } from "@/lib/db/mongoose";
import { Order, WebhookEvent } from "@/lib/db/models";
import { verifyWebhookSignature } from "@/lib/razorpay";

const paymentEntity = z.object({
  id: z.string(),
  order_id: z.string(),
  amount: z.number(),
  error_description: z.string().nullish(),
  error_reason: z.string().nullish(),
});

const webhookSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({ entity: paymentEntity }).optional(),
    refund: z.object({ entity: z.object({ payment_id: z.string() }) }).optional(),
  }),
});

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const parsed = webhookSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  const { event, payload } = parsed.data;

  await connectDb();

  const eventId = req.headers.get("x-razorpay-event-id") ?? `${event}:${payload.payment?.entity.id ?? payload.refund?.entity.payment_id ?? raw.length}`;
  try {
    await WebhookEvent.create({ provider: "razorpay", eventId, type: event });
  } catch {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const payment = payload.payment?.entity;

  if ((event === "payment.captured" || event === "order.paid") && payment) {
    const order = await Order.findOne({ "payment.razorpayOrderId": payment.order_id });
    if (order && order.status === "pending" && Math.round(order.pricing.total * 100) === payment.amount) {
      order.payment.status = "paid";
      order.payment.razorpayPaymentId = payment.id;
      order.payment.paidAt = new Date();
      await confirmOrder(order, "Payment confirmed by Razorpay webhook");
    }
  }

  if (event === "payment.failed" && payment) {
    const order = await Order.findOne({ "payment.razorpayOrderId": payment.order_id });
    if (order && order.status === "pending") {
      await failOrder(order, payment.error_description ?? payment.error_reason ?? "Payment failed");
    }
  }

  if (event === "refund.processed" && payload.refund) {
    await Order.updateOne(
      { "payment.razorpayPaymentId": payload.refund.entity.payment_id },
      { $set: { "payment.status": "refunded" } },
    );
  }

  await expireStaleReservations();
  return NextResponse.json({ ok: true });
}
