const METRO_PREFIXES = ["11", "40", "56", "60", "70", "50", "38", "41", "20", "30"];
const REMOTE_PREFIXES = ["19", "79", "78", "74", "68", "37", "17", "18"];

export type DeliveryEstimate = {
  serviceable: boolean;
  standardDays: number;
  expressAvailable: boolean;
  codAvailable: boolean;
  region: "metro" | "city" | "remote";
};

export function estimateDelivery(pincode: string): DeliveryEstimate {
  const prefix = pincode.slice(0, 2);
  if (REMOTE_PREFIXES.includes(prefix)) {
    return { serviceable: true, standardDays: 7, expressAvailable: false, codAvailable: false, region: "remote" };
  }
  if (METRO_PREFIXES.includes(prefix)) {
    return { serviceable: true, standardDays: 2, expressAvailable: true, codAvailable: true, region: "metro" };
  }
  return { serviceable: true, standardDays: 4, expressAvailable: true, codAvailable: true, region: "city" };
}

export function deliveryDate(days: number, from = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
