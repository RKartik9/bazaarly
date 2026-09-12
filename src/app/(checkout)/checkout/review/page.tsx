import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutShell } from "@/features/checkout/components/checkout-shell";
import { ReviewStep } from "@/features/checkout/components/review-step";
import { requireAddressStep } from "@/features/checkout/queries";
import { computeTotals } from "@/features/cart/pricing";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Checkout · Review", robots: { index: false } };

export default async function CheckoutReviewPage() {
  const { cart, draft, address } = await requireAddressStep();
  if (!draft.payment) redirect("/checkout/payment");

  const codFee = draft.payment === "cod" ? siteConfig.codFee : 0;
  const totals = computeTotals(cart.lines, cart.coupon?.discount ?? 0, cart.coupon?.freeShipping ?? false, draft.delivery, codFee);

  return (
    <CheckoutShell step="review" title="Review and place your order" cart={cart} delivery={draft.delivery} payment={draft.payment}>
      <ReviewStep address={address} delivery={draft.delivery} payment={draft.payment} total={totals.total} />
    </CheckoutShell>
  );
}
