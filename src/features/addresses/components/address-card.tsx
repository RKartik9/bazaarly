import { Briefcase, Home, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AddressDto, AddressSnapshot } from "../types";

const icons = { home: Home, work: Briefcase, other: MapPin } as const;

export function formatAddressLines(a: AddressSnapshot) {
  return [a.line1, a.line2, a.landmark].filter(Boolean);
}

type Props = {
  address: AddressDto | AddressSnapshot;
  selected?: boolean;
  actions?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function AddressCard({ address, selected, actions, className, compact }: Props) {
  const Icon = icons[address.type] ?? MapPin;
  const isDefault = "isDefault" in address && address.isDefault;

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-card p-4 transition",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border/70",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-foreground/70">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{address.fullName}</p>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">{address.type}</span>
            {isDefault && <span className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-teal">Default</span>}
          </div>
          <p className={cn("mt-1 text-foreground/80", compact && "line-clamp-2")}>
            {formatAddressLines(address).join(", ")}
          </p>
          <p className="text-foreground/80">
            {address.city}, {address.state} <span className="tabular-nums">{address.pincode}</span>
          </p>
          <p className="mt-1 text-muted-foreground">Mobile: <span className="tabular-nums">{address.phone}</span></p>
        </div>
      </div>
      {actions && <div className="mt-3 flex flex-wrap items-center gap-1 border-t pt-3">{actions}</div>}
    </div>
  );
}
