import { z } from "zod";
import { objectId, safeText } from "@/lib/validation";

export const createReviewSchema = z.object({
  productId: objectId,
  rating: z.number().int().min(1).max(5),
  title: safeText(120).pipe(z.string().min(3, "Give your review a short title")),
  body: safeText(2000).pipe(z.string().min(20, "Tell us a little more (at least 20 characters)")),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
