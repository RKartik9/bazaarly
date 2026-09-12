import { Check, Package, PackageCheck, Truck, Home, XCircle, Undo2 } from "lucide-react";
import type { OrderStatus } from "@/lib/db/enums";
import { cn } from "@/lib/utils";
import type { OrderTimelineDto } from "../types";

const FLOW: { status: OrderStatus; label: string; icon: typeof Check }[] = [
  { status: "confirmed", label: "Confirmed", icon: Check },
  { status: "packed", label: "Packed", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: Home },
];

const TERMINAL: Partial<Record<OrderStatus, { label: string; icon: typeof Check; tone: string }>> = {
  cancelled: { label: "Cancelled", icon: XCircle, tone: "bg-destructive text-destructive-foreground" },
  return_requested: { label: "Return requested", icon: Undo2, tone: "bg-saffron text-saffron-foreground" },
  returned: { label: "Returned", icon: PackageCheck, tone: "bg-muted text-foreground" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function OrderTimeline({ status, timeline }: { status: OrderStatus; timeline: OrderTimelineDto[] }) {
  const reached = new Map(timeline.map((t) => [t.status, t.at]));
  const currentIndex = FLOW.findIndex((s) => s.status === status);
  const terminal = TERMINAL[status];

  return (
    <div>
      <ol className="grid grid-cols-4 gap-2">
        {FLOW.map((step, i) => {
          const at = reached.get(step.status);
          const done = !!at || (currentIndex >= i && !terminal);
          const active = i === currentIndex;
          const Icon = step.icon;
          return (
            <li key={step.status} className="relative flex flex-col items-center text-center">
              {i > 0 && <span className={cn("absolute right-1/2 top-4 -z-0 h-0.5 w-full", done ? "bg-success" : "bg-border")} />}
              <span
                className={cn(
                  "relative z-10 grid size-8 place-items-center rounded-full border-2 bg-card transition",
                  done ? "border-success bg-success text-success-foreground" : "border-border text-muted-foreground",
                  active && !terminal && "ring-4 ring-success/20",
                )}
              >
                <Icon className="size-4" />
              </span>
              <p className={cn("mt-2 text-xs font-semibold", done ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
              {at && <p className="text-[11px] text-muted-foreground">{fmt(at)}</p>}
            </li>
          );
        })}
      </ol>

      {terminal && (
        <div className={cn("mt-5 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium", terminal.tone)}>
          <terminal.icon className="size-4" />
          {terminal.label}
          {reached.get(status) && <span className="ml-auto text-xs opacity-80">{fmt(reached.get(status)!)}</span>}
        </div>
      )}

      <ul className="mt-6 space-y-3 border-l-2 border-border pl-4">
        {[...timeline].reverse().map((t, i) => (
          <li key={`${t.status}-${i}`} className="relative text-sm">
            <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-primary" />
            <p className="font-medium">{t.note || t.status}</p>
            <p className="text-xs text-muted-foreground">{fmt(t.at)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
