import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/db/enums";
import { safeText } from "@/lib/validation";

export const orderNumberSchema = z.string().regex(/^BZ[A-Z0-9]{11}$/, "Invalid order number");

export const transitionSchema = z.object({
  orderNumber: orderNumberSchema,
  status: z.enum(ORDER_STATUSES),
  note: safeText(300).default(""),
});

export const noteSchema = z.object({
  orderNumber: orderNumberSchema,
  note: safeText(300).pipe(z.string().min(2, "Write a short note")),
});
