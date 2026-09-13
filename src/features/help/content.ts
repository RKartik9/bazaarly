import type { LucideIcon } from "lucide-react";

export type Stat = { value: string; label: string; tint: "mint" | "sky" | "lavender" | "butter" };
export type Step = { icon: LucideIcon; title: string; text: string };
export type CompareColumn = { title: string; tone: "good" | "bad"; items: string[] };
export type TableRow = { label: string; value: string; note?: string };
export type Faq = { q: string; a: string };

export const HELP_LINKS = [
  { href: "/help/returns", label: "Returns & refunds" },
  { href: "/help/shipping", label: "Shipping policy" },
  { href: "/help/contact", label: "Contact us" },
  { href: "/account/orders", label: "Track an order" },
] as const;

export const CONTACT_TOPICS = ["order", "return", "payment", "product", "account", "other"] as const;

export const CONTACT_TOPIC_LABEL: Record<(typeof CONTACT_TOPICS)[number], string> = {
  order: "An order or delivery",
  return: "A return or refund",
  payment: "A payment problem",
  product: "A product question",
  account: "My account",
  other: "Something else",
};
