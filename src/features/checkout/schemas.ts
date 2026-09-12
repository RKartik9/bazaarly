import { z } from "zod";
import { DELIVERY_OPTIONS, PAYMENT_METHODS } from "@/lib/db/enums";
import { objectId } from "@/lib/validation";

export const selectAddressSchema = z.object({ addressId: objectId });
export const selectDeliverySchema = z.object({ delivery: z.enum(DELIVERY_OPTIONS) });
export const selectPaymentSchema = z.object({ payment: z.enum(PAYMENT_METHODS) });

export const placeOrderSchema = z.object({
  addressId: objectId,
  delivery: z.enum(DELIVERY_OPTIONS),
  payment: z.enum(PAYMENT_METHODS),
});

const razorpayId = (prefix: string) => z.string().regex(new RegExp(`^${prefix}_[A-Za-z0-9]{14}$`), "Invalid Razorpay id");

export const verifyPaymentSchema = z.object({
  orderNumber: z.string().regex(/^BZ[A-Z0-9]{11}$/, "Invalid order number"),
  razorpayOrderId: razorpayId("order"),
  razorpayPaymentId: razorpayId("pay"),
  razorpaySignature: z.string().regex(/^[a-f0-9]{64}$/i, "Invalid signature"),
});

export const paymentFailedSchema = z.object({
  orderNumber: z.string().regex(/^BZ[A-Z0-9]{11}$/, "Invalid order number"),
  reason: z.string().trim().max(200).default("Payment failed"),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
