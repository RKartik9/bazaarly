import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { DELIVERY_OPTIONS, PAYMENT_METHODS } from "@/lib/db/models";
import { objectId } from "@/lib/validation";

const COOKIE = "bz_checkout";
const ONE_DAY = 60 * 60 * 24;

export const draftSchema = z.object({
  addressId: objectId.optional(),
  delivery: z.enum(DELIVERY_OPTIONS).default("standard"),
  payment: z.enum(PAYMENT_METHODS).optional(),
});

export type CheckoutDraft = z.infer<typeof draftSchema>;

export async function readDraft(): Promise<CheckoutDraft> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return { delivery: "standard" };
  try {
    const parsed = draftSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : { delivery: "standard" };
  } catch {
    return { delivery: "standard" };
  }
}

export async function writeDraft(patch: Partial<CheckoutDraft>) {
  const current = await readDraft();
  const next = draftSchema.parse({ ...current, ...patch });
  (await cookies()).set(COOKIE, JSON.stringify(next), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_DAY,
  });
  return next;
}

export async function clearDraft() {
  (await cookies()).delete(COOKIE);
}
