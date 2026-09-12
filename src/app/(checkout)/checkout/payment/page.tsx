import type { Metadata } from "next";
import { CheckoutShell } from "@/features/checkout/components/checkout-shell";
import { PaymentStep } from "@/features/checkout/components/payment-step";
import { requireAddressStep } from "@/features/checkout/queries";
import { razorpayConfigured } from "@/lib/env";
import { estimateDelivery } from "@/lib/shipping";

export const metadata: Metadata = { title: "Checkout · Payment", robots: { index: false } };

export default async function CheckoutPaymentPage() {
  const { cart, draft, address } = await requireAddressStep();
  const estimate = estimateDelivery(address.pincode);

  return (
    <CheckoutShell step="payment" title="How would you like to pay?" cart={cart} delivery={draft.delivery} payment={draft.payment}>
      <PaymentStep initial={draft.payment} razorpayEnabled={razorpayConfigured} codAvailable={estimate.codAvailable} />
    </CheckoutShell>
  );
}
