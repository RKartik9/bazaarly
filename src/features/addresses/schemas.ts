import { z } from "zod";
import { ADDRESS_TYPES } from "@/lib/db/enums";
import { indianPhone, objectId, pincode, safeText } from "@/lib/validation";

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export const addressInputSchema = z.object({
  fullName: safeText(80).pipe(z.string().min(2, "Enter the recipient's name")),
  phone: indianPhone,
  line1: safeText(120).pipe(z.string().min(5, "Enter a street address")),
  line2: safeText(120).optional().default(""),
  landmark: safeText(80).optional().default(""),
  city: safeText(60).pipe(z.string().min(2, "Enter a city")),
  state: z.enum(INDIAN_STATES, { message: "Pick a state" }),
  pincode,
  type: z.enum(ADDRESS_TYPES).default("home"),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = addressInputSchema.extend({ id: objectId });
export const addressIdSchema = z.object({ id: objectId });

export type AddressInput = z.output<typeof addressInputSchema>;
export type AddressFormValues = z.input<typeof addressInputSchema>;
