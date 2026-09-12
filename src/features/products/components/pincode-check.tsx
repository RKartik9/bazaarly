"use client";

import { useState, useSyncExternalStore } from "react";
import { MapPin, Truck, Zap, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deliveryDate, estimateDelivery, formatDeliveryDate, type DeliveryEstimate } from "@/lib/shipping";

const STORAGE_KEY = "bz_pincode";
const PIN_RE = /^[1-9]\d{5}$/;

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};
const readPincode = () => window.localStorage.getItem(STORAGE_KEY);
const writePincode = (pin: string | null) => {
  if (pin) window.localStorage.setItem(STORAGE_KEY, pin);
  else window.localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((l) => l());
};

export function PincodeCheck() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const saved = useSyncExternalStore(subscribe, readPincode, () => null);
  const result: { pin: string; estimate: DeliveryEstimate } | null = saved && PIN_RE.test(saved) ? { pin: saved, estimate: estimateDelivery(saved) } : null;

  const check = () => {
    if (!PIN_RE.test(value)) {
      setError("Enter a valid 6-digit pincode");
      return;
    }
    setError(null);
    writePincode(value);
    setValue("");
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <MapPin className="size-4 text-primary" />
        {result ? (
          <span>
            Delivering to <span className="tabular-nums">{result.pin}</span>
            <button type="button" onClick={() => writePincode(null)} className="ml-2 text-xs font-medium text-secondary hover:underline">
              Change
            </button>
          </span>
        ) : (
          "Check delivery"
        )}
      </div>

      {!result && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            check();
          }}
        >
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter pincode"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
            aria-label="Pincode"
            className="h-10 rounded-full bg-background"
          />
          <Button type="submit" variant="secondary" className="h-10 rounded-full px-5">
            Check
          </Button>
        </form>
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      {result && (
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Truck className="size-4 text-teal" />
            Standard delivery by <strong>{formatDeliveryDate(deliveryDate(result.estimate.standardDays))}</strong>
          </li>
          {result.estimate.expressAvailable && (
            <li className="flex items-center gap-2">
              <Zap className="size-4 text-saffron-foreground" />
              Express by <strong>{formatDeliveryDate(deliveryDate(1))}</strong>
            </li>
          )}
          <li className="flex items-center gap-2 text-muted-foreground">
            <Banknote className="size-4" />
            {result.estimate.codAvailable ? "Cash on delivery available" : "Prepaid only for this pincode"}
          </li>
        </ul>
      )}
    </div>
  );
}
