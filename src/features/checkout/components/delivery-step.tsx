"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Loader2, Truck, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { DeliveryOption } from "@/lib/db/enums";
import { formatPrice } from "@/lib/money";
import { deliveryDate, formatDeliveryDate, type DeliveryEstimate } from "@/lib/shipping";
import { siteConfig } from "@/lib/site";
import { selectDeliveryAction } from "../actions";
import { OptionCard } from "./option-card";

type Props = { estimate: DeliveryEstimate; initial: DeliveryOption; standardFee: number };

export function DeliveryStep({ estimate, initial, standardFee }: Props) {
  const router = useRouter();
  const [choice, setChoice] = useState<DeliveryOption>(estimate.expressAvailable ? initial : "standard");
  const [pending, start] = useTransition();

  const next = () =>
    start(async () => {
      const result = await selectDeliveryAction({ delivery: choice });
      if (result.serverError) {
        toast.error(result.serverError);
        return;
      }
      router.push("/checkout/payment");
    });

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <OptionCard
          selected={choice === "standard"}
          onSelect={() => setChoice("standard")}
          icon={<Truck className="size-5" />}
          title="Standard delivery"
          description={`Arrives by ${formatDeliveryDate(deliveryDate(estimate.standardDays))}`}
          trailing={standardFee === 0 ? <span className="text-success">Free</span> : formatPrice(standardFee)}
        />
        <OptionCard
          selected={choice === "express"}
          disabled={!estimate.expressAvailable}
          onSelect={() => setChoice("express")}
          icon={<Zap className="size-5" />}
          title="Express delivery"
          badge={estimate.expressAvailable ? "Fastest" : undefined}
          description={estimate.expressAvailable ? `Arrives by ${formatDeliveryDate(deliveryDate(1))}` : "Not available for this pincode yet"}
          trailing={formatPrice(siteConfig.expressShippingFee)}
        />
      </div>
      <Button size="xl" className="rounded-xl" disabled={pending} onClick={next}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Continue to payment <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
