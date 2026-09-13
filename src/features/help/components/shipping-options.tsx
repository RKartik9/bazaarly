import { cn } from "@/lib/utils";
import type { ShippingOption } from "../shipping-content";

export function ShippingOptions({ options }: { options: ShippingOption[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((o) => (
        <div key={o.name} className={cn("rounded-2xl border p-4 shadow-soft", o.highlight ? "border-primary/40 bg-primary/5" : "border-border/70 bg-card")}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold">{o.name}</p>
            {o.highlight && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Popular</span>}
          </div>
          <p className="mt-3 font-heading text-2xl font-extrabold leading-none">{o.fee}</p>
          <p className="mt-1 text-sm font-medium">{o.time}</p>
          <p className="mt-2 text-xs text-muted-foreground">{o.where}</p>
        </div>
      ))}
    </div>
  );
}
