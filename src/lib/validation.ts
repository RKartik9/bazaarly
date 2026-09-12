import { z } from "zod";
import { ALLOWED_IMAGE_HOSTS, isAllowedImageUrl } from "./images";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const slug = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9-]+$/, "Invalid slug");

export const sku = z
  .string()
  .min(2)
  .max(40)
  .regex(/^[A-Z0-9-]+$/i, "Invalid SKU")
  .transform((v) => v.toUpperCase());

export const quantity = z.number().int().min(1).max(10);

export const indianPhone = z
  .string()
  .trim()
  .regex(/^(\+91[-\s]?)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

export const pincode = z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode");

export const couponCode = z
  .string()
  .trim()
  .min(3)
  .max(20)
  .regex(/^[A-Z0-9]+$/i, "Invalid coupon code")
  .transform((v) => v.toUpperCase());

export const safeText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v.replace(/[<>]/g, ""));

export const httpsUrl = z.string().url().startsWith("https://");

export const imageUrl = httpsUrl.refine(isAllowedImageUrl, {
  message: `Images must be hosted on ${ALLOWED_IMAGE_HOSTS.join(", ")}`,
});
