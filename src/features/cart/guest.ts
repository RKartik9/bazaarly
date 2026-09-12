import "server-only";
import { cookies } from "next/headers";

export const GUEST_CART_COOKIE = "bz_cart";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function readGuestToken() {
  const store = await cookies();
  return store.get(GUEST_CART_COOKIE)?.value ?? null;
}

export async function ensureGuestToken() {
  const existing = await readGuestToken();
  if (existing) return existing;
  const token = crypto.randomUUID();
  const store = await cookies();
  store.set(GUEST_CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
  return token;
}

export async function clearGuestToken() {
  const store = await cookies();
  store.delete(GUEST_CART_COOKIE);
}
