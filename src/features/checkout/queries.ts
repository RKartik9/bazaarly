import "server-only";
import { redirect } from "next/navigation";
import { getUserAddress, getUserAddresses } from "@/features/addresses/queries";
import { getCart } from "@/features/cart/queries";
import { requireSessionUser } from "@/lib/auth/current-user";
import { readDraft } from "./draft";

export async function loadCheckout() {
  const user = await requireSessionUser("/checkout");
  const [cart, draft, addresses] = await Promise.all([getCart(), readDraft(), getUserAddresses(user.id)]);
  if (!cart.lines.length) redirect("/cart");
  const address = draft.addressId ? addresses.find((a) => a.id === draft.addressId) ?? (await getUserAddress(user.id, draft.addressId)) : null;
  return { user, cart, draft, addresses, address };
}

export async function requireAddressStep() {
  const state = await loadCheckout();
  if (!state.address) redirect("/checkout/address");
  return { ...state, address: state.address };
}
