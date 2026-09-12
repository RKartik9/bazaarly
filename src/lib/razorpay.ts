import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";
import { env, razorpayConfigured } from "./env";
import { AppError } from "./errors";
import { toPaise } from "./money";

let client: Razorpay | null = null;

export function razorpay(): Razorpay {
  if (!razorpayConfigured) throw new AppError("Online payments are not configured yet. Please choose cash on delivery.", 503);
  client ??= new Razorpay({ key_id: env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, key_secret: env.RAZORPAY_KEY_SECRET! });
  return client;
}

const MIN_AMOUNT_PAISE = 100;

type RazorpayApiError = { statusCode?: number; error?: { code?: string; description?: string } };

function mapRazorpayError(error: unknown): never {
  const e = error as RazorpayApiError;
  if (e?.statusCode === 401) throw new AppError("Payment gateway rejected our credentials. Please try cash on delivery.", 401);
  const description = e?.error?.description;
  console.error("[razorpay]", e?.statusCode, e?.error ?? error);
  throw new AppError(description ? `Payment gateway error: ${description}` : "Could not start the payment. Please try again.", 502);
}

export async function createRazorpayOrder(input: { amount: number; receipt: string; notes?: Record<string, string> }) {
  const amount = toPaise(input.amount);
  if (!Number.isInteger(amount) || amount < MIN_AMOUNT_PAISE) {
    throw new AppError(`Online payments need a minimum order of ₹${MIN_AMOUNT_PAISE / 100}.`);
  }

  try {
    const order = await razorpay().orders.create({
      amount,
      currency: "INR",
      receipt: input.receipt.slice(0, 40),
      notes: input.notes,
    });
    return { id: order.id, amount: Number(order.amount), currency: order.currency };
  } catch (error) {
    return mapRazorpayError(error);
  }
}

function safeEqualHex(a: string, b: string) {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  return bufA.length === bufB.length && bufA.length > 0 && timingSafeEqual(bufA, bufB);
}

export function verifyPaymentSignature(input: { razorpayOrderId: string; razorpayPaymentId: string; signature: string }) {
  if (!env.RAZORPAY_KEY_SECRET) return false;
  const expected = createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");
  return safeEqualHex(expected, input.signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  if (!env.RAZORPAY_WEBHOOK_SECRET || !signature) return false;
  const expected = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

export async function fetchPayment(paymentId: string) {
  return razorpay().payments.fetch(paymentId);
}

export async function refundPayment(paymentId: string, amount: number, notes?: Record<string, string>) {
  const refund = await razorpay().payments.refund(paymentId, { amount: toPaise(amount), speed: "normal", notes });
  return { id: refund.id, status: refund.status };
}
