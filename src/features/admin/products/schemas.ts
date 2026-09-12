import { z } from "zod";
import { PRODUCT_STATUSES } from "@/lib/db/enums";
import { imageUrl, objectId, safeText, sku, slug } from "@/lib/validation";

const money = z.coerce.number().min(0).max(10_000_000);

export const variantSchema = z
  .object({
    sku,
    attributes: z.record(z.string().max(40), z.string().trim().max(60)).default({}),
    price: money,
    mrp: money,
    stock: z.coerce.number().int().min(0).max(1_000_000),
    image: z.union([imageUrl, z.literal("")]).default(""),
  })
  .refine((v) => v.mrp >= v.price, { message: "MRP must be at least the price", path: ["mrp"] });

const kvSchema = z.object({ key: safeText(60).pipe(z.string().min(1, "Required")), value: safeText(200).pipe(z.string().min(1, "Required")) });

export const productInputSchema = z.object({
  title: safeText(160).pipe(z.string().min(3, "Title is too short")),
  slug,
  brand: safeText(60).pipe(z.string().min(1, "Brand is required")),
  category: objectId,
  description: safeText(5000),
  highlights: z.array(safeText(160).pipe(z.string().min(1))).max(12).default([]),
  specs: z.array(kvSchema).max(40).default([]),
  images: z.array(imageUrl).min(1, "Add at least one image").max(8),
  variantAxes: z.array(safeText(40).pipe(z.string().min(1))).max(3).default([]),
  variants: z.array(variantSchema).min(1, "Add at least one variant").max(60),
  tags: z.array(safeText(30).pipe(z.string().min(1))).max(15).default([]),
  isFeatured: z.boolean().default(false),
  isDeal: z.boolean().default(false),
  dealEndsAt: z.union([z.iso.datetime({ offset: true }), z.literal("")]).default(""),
  status: z.enum(PRODUCT_STATUSES).default("active"),
});

export type ProductInput = z.output<typeof productInputSchema>;
export type ProductFormValues = z.input<typeof productInputSchema>;

export const updateProductSchema = z.object({ id: objectId, data: productInputSchema });
export const productIdSchema = z.object({ id: objectId });
export const setStatusSchema = z.object({ id: objectId, status: z.enum(PRODUCT_STATUSES) });
export const bulkStockSchema = z.object({
  updates: z.array(z.object({ sku, stock: z.coerce.number().int().min(0).max(1_000_000) })).min(1).max(200),
});
export const uploadSignatureSchema = z.object({ folder: z.enum(["products", "categories"]) });
