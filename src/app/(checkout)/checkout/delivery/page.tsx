import type { Metadata } from "next";
import { CheckoutShell } from "@/features/checkout/components/checkout-shell";
import { DeliveryStep } from "@/features/checkout/components/delivery-step";
import { requireAddressStep } from "@/features/checkout/queries";
import { shippingFee } from "@/features/cart/pricing";
import { estimateDelivery } from "@/lib/shipping";

export const metadata: Metadata = { title: "Checkout · Delivery", robots: { index: false } };

export default async function CheckoutDeliveryPage() {
  const { cart, draft, address } = await requireAddressStep();
  const estimate = estimateDelivery(address.pincode);
  const standardFee = shippingFee(cart.totals.subtotal - cart.totals.couponDiscount, cart.coupon?.freeShipping ?? false, "standard");

  return (
    <CheckoutShell step="delivery" title="How fast do you need it?" description={`Delivering to ${address.city}, ${address.pincode}.`} cart={cart} delivery={draft.delivery} payment={draft.payment}>
      <DeliveryStep estimate={estimate} initial={draft.delivery} standardFee={standardFee} />
    </CheckoutShell>
  );
}
