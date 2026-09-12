import { z } from "zod";
import { imageUrl, objectId, safeText, slug } from "@/lib/validation";

export const CATEGORY_TINTS = ["blush", "mint", "sky", "lavender", "butter"] as const;

export const categoryInputSchema = z.object({
  name: safeText(60).pipe(z.string().min(2, "Name is too short")),
  slug,
  description: safeText(300),
  image: z.union([imageUrl, z.literal("")]).default(""),
  tint: z.enum(CATEGORY_TINTS).default("blush"),
  parent: z.union([objectId, z.literal("")]).default(""),
  order: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.output<typeof categoryInputSchema>;
export type CategoryFormValues = z.input<typeof categoryInputSchema>;

export const updateCategorySchema = z.object({ id: objectId, data: categoryInputSchema });
export const categoryIdSchema = z.object({ id: objectId });
