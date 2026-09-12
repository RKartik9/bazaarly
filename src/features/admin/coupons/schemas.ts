import { z } from "zod";
import { COUPON_TYPES } from "@/lib/db/enums";
import { couponCode, objectId, safeText } from "@/lib/validation";

const optionalNumber = z.union([z.coerce.number().min(0).max(10_000_000), z.literal(""), z.null()]).transform((v) => (v === "" || v === null ? null : v));
const optionalDate = z.union([z.iso.datetime({ offset: true }), z.literal("")]).default("");

export const couponInputSchema = z
  .object({
    code: couponCode,
    description: safeText(160),
    type: z.enum(COUPON_TYPES),
    value: z.coerce.number().min(0).max(1_000_000),
    minOrder: z.coerce.number().min(0).max(10_000_000).default(0),
    maxDiscount: optionalNumber.default(null),
    usageLimit: optionalNumber.default(null),
    perUserLimit: z.coerce.number().int().min(1).max(100).default(1),
    startsAt: optionalDate,
    expiresAt: optionalDate,
    isActive: z.boolean().default(true),
  })
  .refine((c) => c.type !== "percent" || c.value <= 90, { message: "Percent discounts are capped at 90%", path: ["value"] })
  .refine((c) => c.type === "free_shipping" || c.value > 0, { message: "Enter a discount value", path: ["value"] })
  .refine((c) => !c.startsAt || !c.expiresAt || new Date(c.expiresAt) > new Date(c.startsAt), { message: "Expiry must be after the start", path: ["expiresAt"] });

export type CouponInput = z.output<typeof couponInputSchema>;
export type CouponFormValues = z.input<typeof couponInputSchema>;

export const updateCouponSchema = z.object({ id: objectId, data: couponInputSchema });
export const couponIdSchema = z.object({ id: objectId });
export const toggleCouponSchema = z.object({ id: objectId, isActive: z.boolean() });
