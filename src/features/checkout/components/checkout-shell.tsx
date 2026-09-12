import Image from "next/image";
import type { CartDto } from "@/features/cart/types";
import { PriceBreakdown } from "@/features/cart/components/price-breakdown";
import { computeTotals } from "@/features/cart/pricing";
import type { DeliveryOption, PaymentMethod } from "@/lib/db/models";
import { siteConfig } from "@/lib/site";
import { CheckoutStepper, type CheckoutStep } from "./checkout-stepper";

type Props = {
  step: CheckoutStep;
  title: string;
  description?: string;
  cart: CartDto;
  delivery?: DeliveryOption;
  payment?: PaymentMethod;
  children: React.ReactNode;
};

export function CheckoutShell({ step, title, description, cart, delivery = "standard", payment, children }: Props) {
  const codFee = payment === "cod" ? siteConfig.codFee : 0;
  const totals = computeTotals(cart.lines, cart.coupon?.discount ?? 0, cart.coupon?.freeShipping ?? false, delivery, 0);

  return (
    <div className="space-y-8">
      <CheckoutStepper current={step} />
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="min-w-0">
          <h1 className="font-heading text-3xl font-extrabold">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          <div className="mt-6">{children}</div>
        </section>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-3xl bg-card p-5 shadow-soft">
            <h2 className="font-heading text-lg font-bold">
              Order summary <span className="text-sm font-normal text-muted-foreground">({totals.itemCount} items)</span>
            </h2>
            <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {cart.lines.map((line) => (
                <li key={line.sku} className="flex gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {line.image && <Image src={line.image} alt="" fill sizes="56px" className="object-cover" />}
                    <span className="absolute -right-0 -top-0 grid size-5 place-items-center rounded-bl-lg bg-ink text-[10px] font-bold text-background tabular-nums">
                      {line.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="line-clamp-1 font-medium">{line.title}</p>
                    <p className="text-xs text-muted-foreground">{Object.values(line.attributes).join(" · ")}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">₹{(line.price * line.qty).toLocaleString("en-IN")}</p>
                </li>
              ))}
            </ul>
            <PriceBreakdown totals={totals} codFee={codFee} compact className="mt-5 border-t pt-4" />
          </div>
        </aside>
      </div>
    </div>
  );
}
