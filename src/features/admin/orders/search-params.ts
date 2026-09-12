import { createLoader, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs/server";
import { ORDER_STATUSES } from "@/lib/db/enums";

export const ORDER_PAGE_SIZE = 20;

export const adminOrderParsers = {
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral(["all", ...ORDER_STATUSES] as const).withDefault("all"),
  payment: parseAsStringLiteral(["all", "razorpay", "cod"] as const).withDefault("all"),
  page: parseAsInteger.withDefault(1),
};

export const loadAdminOrderParams = createLoader(adminOrderParsers);
export type AdminOrderParams = Awaited<ReturnType<typeof loadAdminOrderParams>>;
