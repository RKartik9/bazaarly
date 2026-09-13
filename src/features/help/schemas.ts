import { z } from "zod";
import { safeText } from "@/lib/validation";
import { CONTACT_TOPICS } from "./content";

export const contactSchema = z.object({
  name: safeText(80).pipe(z.string().min(2, "Tell us your name")),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  topic: z.enum(CONTACT_TOPICS),
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^(BZ[A-Z0-9]{11})?$/, "Order numbers look like BZXXXXXXXXXXX")
    .optional()
    .or(z.literal("")),
  message: safeText(2000).pipe(z.string().min(20, "Give us a little more detail (20+ characters)")),
  website: z.string().max(0).optional(),
});

export type ContactInput = z.output<typeof contactSchema>;
export type ContactFormValues = z.input<typeof contactSchema>;
