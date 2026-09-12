import { createLoader, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs/server";

export const ADMIN_PAGE_SIZE = 20;

export const adminProductParsers = {
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral(["all", "active", "draft", "archived"] as const).withDefault("all"),
  stock: parseAsStringLiteral(["all", "low", "out"] as const).withDefault("all"),
  category: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

export const loadAdminProductParams = createLoader(adminProductParsers);
export type AdminProductParams = Awaited<ReturnType<typeof loadAdminProductParams>>;
