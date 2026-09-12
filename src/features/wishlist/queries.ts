import "server-only";
import { cache } from "react";
import { getSessionUser } from "@/lib/auth/current-user";
import { connectDb } from "@/lib/db/mongoose";
import { Wishlist } from "@/lib/db/models";

export const getWishlistIds = cache(async (): Promise<string[]> => {
  const user = await getSessionUser();
  if (!user) return [];
  await connectDb();
  const doc = await Wishlist.findOne({ userId: user.id }).select("products").lean();
  return doc?.products.map((p) => p.toString()) ?? [];
});
