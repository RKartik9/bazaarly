import type { Metadata } from "next";
import { CartPageView } from "@/features/cart/components/cart-page-view";
import { Crumbs } from "@/features/catalog/components/crumbs";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-x space-y-6 py-6 sm:py-8">
      <div>
        <Crumbs items={[{ label: "Bag" }]} />
        <h1 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">Your bag</h1>
      </div>
      <CartPageView />
    </div>
  );
}
