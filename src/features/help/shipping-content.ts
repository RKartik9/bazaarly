import { Bell, MapPinned, PackageCheck, Truck } from "lucide-react";
import { siteConfig } from "@/lib/site";
import type { Faq, Stat, Step, TableRow } from "./content";

export const SHIPPING_STATS: Stat[] = [
  { value: "Free", label: `shipping over ₹${siteConfig.freeShippingThreshold}`, tint: "mint" },
  { value: "2–4 days", label: "standard delivery", tint: "sky" },
  { value: "Next day", label: "express in metros", tint: "lavender" },
  { value: "COD", label: "in most pincodes", tint: "butter" },
];

export type ShippingOption = { name: string; fee: string; time: string; where: string; highlight?: boolean };

export const SHIPPING_OPTIONS: ShippingOption[] = [
  { name: "Standard", fee: `₹${siteConfig.standardShippingFee}`, time: "2–4 days", where: "All of India · up to 7 days remote", highlight: true },
  { name: "Express", fee: `₹${siteConfig.expressShippingFee}`, time: "Next day", where: "Metros & most cities" },
  { name: "Cash on delivery", fee: `+₹${siteConfig.codFee}`, time: "Standard speed", where: "Most pincodes" },
];

export const SHIPPING_STEPS: Step[] = [
  { icon: PackageCheck, title: "Packed same day", text: "Order before 2 PM and it leaves today." },
  { icon: Bell, title: "Tracking link", text: "Emailed the moment it ships." },
  { icon: Truck, title: "Out for delivery", text: "Courier calls before arriving. 3 attempts." },
  { icon: MapPinned, title: "Delivered", text: "Follow every step in Account → Orders." },
];

export const COVERAGE_TABLE: TableRow[] = [
  { label: "Metros", value: "2 days", note: "Express & COD available" },
  { label: "Cities & towns", value: "4 days", note: "Express & COD available" },
  { label: "Remote areas", value: "7 days", note: "Standard only, prepaid" },
];

export const SHIPPING_FAQ: Faq[] = [
  { q: "Can I change the address after ordering?", a: "Yes, until it's packed — open the order and tap Change address. After that, contact us and we'll try to reroute it." },
  { q: "Do you ship internationally?", a: "Not yet. India only for now." },
  { q: "Will everything arrive together?", a: "Usually. Large or fragile items may ship separately with their own tracking link." },
];
