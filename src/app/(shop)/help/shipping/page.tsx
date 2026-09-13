import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaqList, HelpSection, InfoTable, StatTiles, Steps } from "@/features/help/components/help-blocks";
import { HelpHeader } from "@/features/help/components/help-shell";
import { ShippingOptions } from "@/features/help/components/shipping-options";
import { COVERAGE_TABLE, SHIPPING_FAQ, SHIPPING_OPTIONS, SHIPPING_STATS, SHIPPING_STEPS } from "@/features/help/shipping-content";

export const metadata: Metadata = {
  title: "Shipping policy",
  description: "Delivery options, fees, timelines and pincode coverage across India.",
};

export default function ShippingPage() {
  return (
    <div className="space-y-10">
      <HelpHeader
        title="Shipping"
        intro="Where we deliver, how fast, and what it costs."
        action={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/account/orders">
              Track an order <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />
      <StatTiles stats={SHIPPING_STATS} />
      <HelpSection title="Delivery options">
        <ShippingOptions options={SHIPPING_OPTIONS} />
      </HelpSection>
      <HelpSection title="From checkout to doorstep">
        <Steps steps={SHIPPING_STEPS} />
      </HelpSection>
      <HelpSection title="Delivery time by region">
        <InfoTable rows={COVERAGE_TABLE} />
        <p className="text-xs text-muted-foreground">Exact dates show on every product page once you enter your pincode.</p>
      </HelpSection>
      <HelpSection title="Quick answers">
        <FaqList items={SHIPPING_FAQ} />
      </HelpSection>
    </div>
  );
}
