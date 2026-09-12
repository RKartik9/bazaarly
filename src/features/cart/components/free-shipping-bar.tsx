"use client";

import { motion } from "motion/react";
import { Truck, PartyPopper } from "lucide-react";
import { formatPrice } from "@/lib/money";
import { siteConfig } from "@/lib/site";

export function FreeShippingBar({ remaining }: { remaining: number }) {
  const progress = Math.min(100, ((siteConfig.freeShippingThreshold - remaining) / siteConfig.freeShippingThreshold) * 100);
  const unlocked = remaining <= 0;

  return (
    <div className="rounded-2xl bg-mint/60 p-3 dark:bg-mint/40">
      <p className="flex items-center gap-2 text-xs font-medium">
        {unlocked ? <PartyPopper className="size-4 text-success" /> : <Truck className="size-4 text-teal" />}
        {unlocked ? "You've unlocked free delivery" : `Add ${formatPrice(remaining)} more for free delivery`}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/70">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-teal to-success"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
