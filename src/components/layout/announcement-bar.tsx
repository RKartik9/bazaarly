import { Sparkles, RotateCcw, Truck, ShieldCheck } from "lucide-react";
import { Marquee } from "@/components/motion/marquee";
import { siteConfig } from "@/lib/site";
import { formatPrice } from "@/lib/money";

const perks = [
  { icon: Truck, text: `Free delivery over ${formatPrice(siteConfig.freeShippingThreshold)}` },
  { icon: RotateCcw, text: "Easy 7-day returns" },
  { icon: ShieldCheck, text: "Secure payments via Razorpay" },
  { icon: Sparkles, text: "Use WELCOME10 for 10% off your first order" },
];

export function AnnouncementBar() {
  return (
    <div className="bg-teal text-teal-foreground">
      <div className="container-x">
        <div className="hidden h-9 items-center justify-center gap-10 text-xs font-medium tracking-wide md:flex">
          {perks.map(({ icon: Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-2">
              <Icon className="size-3.5 text-saffron" />
              {text}
            </span>
          ))}
        </div>
        <Marquee className="h-9 md:hidden" speed={28} pauseOnHover={false}>
          {perks.map(({ icon: Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-2 text-xs font-medium">
              <Icon className="size-3.5 text-saffron" />
              {text}
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
