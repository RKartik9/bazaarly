import { Truck, RotateCcw, ShieldCheck, Headset } from "lucide-react";
import { Counter } from "@/components/motion/counter";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

const perks = [
  { icon: Truck, title: "Fast, free delivery", text: "Free over ₹999. Express in metros in 24 hours.", tint: "bg-mint" },
  { icon: RotateCcw, title: "7-day easy returns", text: "Doorstep pickup and instant refunds to source.", tint: "bg-sky" },
  { icon: ShieldCheck, title: "Secure payments", text: "UPI, cards, wallets and COD through Razorpay.", tint: "bg-lavender" },
  { icon: Headset, title: "Human support", text: "Real people, 9am–9pm, on chat, call and email.", tint: "bg-butter" },
];

const stats = [
  { value: 200000, suffix: "+", label: "orders delivered" },
  { value: 12000, suffix: "+", label: "five-star reviews" },
  { value: 60, suffix: "+", label: "curated brands" },
  { value: 19000, suffix: "+", label: "pincodes served" },
];

export function Perks() {
  return (
    <section className="container-x py-16">
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {perks.map(({ icon: Icon, title, text, tint }) => (
          <StaggerItem key={title} className="rounded-3xl border bg-card p-6 shadow-soft">
            <div className={`mb-4 flex size-11 items-center justify-center rounded-2xl ${tint}`}>
              <Icon className="size-5" />
            </div>
            <p className="font-heading text-lg font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-12 grid grid-cols-2 gap-6 rounded-3xl bg-ink px-6 py-10 text-background sm:grid-cols-4 sm:px-10">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-heading text-3xl font-extrabold sm:text-4xl">
              <Counter value={s.value} />
              <span className="text-primary">{s.suffix}</span>
            </p>
            <p className="mt-1 text-sm text-background/60">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
