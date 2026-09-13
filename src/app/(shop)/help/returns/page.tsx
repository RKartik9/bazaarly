import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompareColumns, FaqList, HelpSection, InfoTable, StatTiles, Steps } from "@/features/help/components/help-blocks";
import { HelpHeader } from "@/features/help/components/help-shell";
import { REFUND_TABLE, RETURN_COMPARE, RETURN_FAQ, RETURN_STATS, RETURN_STEPS } from "@/features/help/returns-content";

export const metadata: Metadata = {
  title: "Returns & refunds",
  description: "7-day easy returns, free pickup and refunds in 3–5 days.",
};

export default function ReturnsPage() {
  return (
    <div className="space-y-10">
      <HelpHeader
        title="Returns & refunds"
        intro="Didn't work out? Return it within 7 days, we pick it up, you get your money back."
        action={
          <Button asChild className="rounded-full">
            <Link href="/account/orders">
              Start a return <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />
      <StatTiles stats={RETURN_STATS} />
      <HelpSection title="How it works">
        <Steps steps={RETURN_STEPS} />
      </HelpSection>
      <HelpSection title="What you can return">
        <CompareColumns columns={RETURN_COMPARE} />
      </HelpSection>
      <HelpSection id="refunds" title="Refund timelines">
        <InfoTable rows={REFUND_TABLE} />
      </HelpSection>
      <HelpSection title="Quick answers">
        <FaqList items={RETURN_FAQ} />
      </HelpSection>
    </div>
  );
}
