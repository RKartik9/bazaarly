import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const CHECKOUT_STEPS = [
  { key: "address", label: "Address", href: "/checkout/address" },
  { key: "delivery", label: "Delivery", href: "/checkout/delivery" },
  { key: "payment", label: "Payment", href: "/checkout/payment" },
  { key: "review", label: "Review", href: "/checkout/review" },
] as const;

export type CheckoutStep = (typeof CHECKOUT_STEPS)[number]["key"];

export function CheckoutStepper({ current }: { current: CheckoutStep }) {
  const currentIndex = CHECKOUT_STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {CHECKOUT_STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const content = (
          <>
            <span
              className={cn(
                "grid size-7 place-items-center rounded-full text-xs font-bold transition",
                done && "bg-success text-success-foreground",
                active && "bg-ink text-background",
                !done && !active && "bg-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className={cn("hidden text-sm font-medium sm:inline", active ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
          </>
        );
        return (
          <li key={step.key} className="flex items-center gap-2 sm:gap-3">
            {done ? (
              <Link href={step.href} className="flex items-center gap-2 hover:opacity-80">
                {content}
              </Link>
            ) : (
              <div className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
                {content}
              </div>
            )}
            {i < CHECKOUT_STEPS.length - 1 && <span className={cn("h-px w-6 sm:w-10", done ? "bg-success" : "bg-border")} />}
          </li>
        );
      })}
    </ol>
  );
}
