import type { Metadata } from "next";
import { AddressStep } from "@/features/checkout/components/address-step";
import { CheckoutShell } from "@/features/checkout/components/checkout-shell";
import { loadCheckout } from "@/features/checkout/queries";

export const metadata: Metadata = { title: "Checkout · Address", robots: { index: false } };

export default async function CheckoutAddressPage() {
  const { cart, draft, addresses } = await loadCheckout();

  return (
    <CheckoutShell step="address" title="Where should we deliver?" description="Choose a saved address or add a new one." cart={cart} delivery={draft.delivery} payment={draft.payment}>
      <AddressStep addresses={addresses} selectedId={draft.addressId} />
    </CheckoutShell>
  );
}
