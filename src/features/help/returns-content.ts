import { BadgeIndianRupee, ClipboardList, PackageOpen, Truck } from "lucide-react";
import type { CompareColumn, Faq, Stat, Step, TableRow } from "./content";

export const RETURN_STATS: Stat[] = [
  { value: "7 days", label: "to return", tint: "mint" },
  { value: "Free", label: "doorstep pickup", tint: "sky" },
  { value: "3–5 days", label: "refund to source", tint: "lavender" },
  { value: "48 hrs", label: "to report damage", tint: "butter" },
];

export const RETURN_STEPS: Step[] = [
  { icon: ClipboardList, title: "Start a return", text: "Account → Orders → Return. Pick a reason." },
  { icon: Truck, title: "We pick it up", text: "Scheduled within 48 hours. Or drop it off." },
  { icon: PackageOpen, title: "Quick check", text: "1–2 business days at our warehouse." },
  { icon: BadgeIndianRupee, title: "Refund issued", text: "To your original payment method." },
];

export const RETURN_COMPARE: CompareColumn[] = [
  { title: "Returnable", tone: "good", items: ["Unused, tags on", "Original packaging", "All accessories included", "Within 7 days of delivery"] },
  { title: "Not returnable", tone: "bad", items: ["Opened beauty & personal care", "Innerwear, swimwear, socks", "In-ear audio with seal broken", "Gift cards & made-to-order"] },
];

export const REFUND_TABLE: TableRow[] = [
  { label: "UPI · Cards · Wallets", value: "3–5 business days", note: "Back to the same account" },
  { label: "Net banking", value: "3–5 business days", note: "Back to the same account" },
  { label: "Cash on delivery", value: "5–7 business days", note: "To your bank via UPI or IMPS" },
  { label: "Shipping fee", value: "Refunded only if", note: "Item was damaged or wrong" },
];

export const RETURN_FAQ: Faq[] = [
  { q: "Can I exchange for a different size?", a: "Yes. Start a return, choose Exchange and pick the size. The replacement ships once pickup is done." },
  { q: "I used a coupon. What do I get back?", a: "Exactly what you paid for that item after the discount. The coupon stays used." },
  { q: "Pickup didn't happen?", a: "Remote pincodes can slip a day. After 3 days, contact us and we'll reschedule or arrange a drop-off." },
];
