import { createLoader, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs/server";

export const CUSTOMER_PAGE_SIZE = 25;

export const adminCustomerParsers = {
  q: parseAsString.withDefault(""),
  sort: parseAsStringLiteral(["recent", "spend", "orders"] as const).withDefault("recent"),
  page: parseAsInteger.withDefault(1),
};

export const loadAdminCustomerParams = createLoader(adminCustomerParsers);
export type AdminCustomerParams = Awaited<ReturnType<typeof loadAdminCustomerParams>>;
