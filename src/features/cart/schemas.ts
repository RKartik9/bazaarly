import { z } from "zod";
import { couponCode, objectId, quantity, sku } from "@/lib/validation";

export const addToCartSchema = z.object({
  productId: objectId,
  sku,
  qty: quantity.default(1),
});

export const updateQtySchema = z.object({
  sku,
  qty: z.number().int().min(0).max(10),
});

export const skuOnlySchema = z.object({ sku });

export const applyCouponSchema = z.object({ code: couponCode });

export type AddToCartInput = z.infer<typeof addToCartSchema>;
