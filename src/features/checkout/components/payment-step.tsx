"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Banknote, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { PaymentMethod } from "@/lib/db/enums";
import { formatPrice } from "@/lib/money";
import { siteConfig } from "@/lib/site";
import { selectPaymentAction } from "../actions";
import { OptionCard } from "./option-card";

type Props = { initial?: PaymentMethod; razorpayEnabled: boolean; codAvailable: boolean };

export function PaymentStep({ initial, razorpayEnabled, codAvailable }: Props) {
  const router = useRouter();
  const fallback: PaymentMethod = razorpayEnabled ? "razorpay" : "cod";
  const [choice, setChoice] = useState<PaymentMethod>(initial ?? fallback);
  const [pending, start] = useTransition();

  const next = () =>
    start(async () => {
      const result = await selectPaymentAction({ payment: choice });
      if (result.serverError) {
        toast.error(result.serverError);
        return;
      }
      router.push("/checkout/review");
    });

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <OptionCard
          selected={choice === "razorpay"}
          disabled={!razorpayEnabled}
          onSelect={() => setChoice("razorpay")}
          icon={<CreditCard className="size-5" />}
          title="Pay online"
          badge="Recommended"
          description={razorpayEnabled ? "UPI, cards, net banking and wallets via Razorpay" : "Online payments are not configured for this store yet"}
        />
        <OptionCard
          selected={choice === "cod"}
          disabled={!codAvailable}
          onSelect={() => setChoice("cod")}
          icon={<Banknote className="size-5" />}
          title="Cash on delivery"
          description={codAvailable ? `Pay when it arrives. ${formatPrice(siteConfig.codFee)} handling fee applies.` : "Not available for this pincode"}
          trailing={codAvailable ? `+ ${formatPrice(siteConfig.codFee)}` : undefined}
        />
      </div>
      <Button size="xl" className="rounded-xl" disabled={pending || (!razorpayEnabled && !codAvailable)} onClick={next}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Review order <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
