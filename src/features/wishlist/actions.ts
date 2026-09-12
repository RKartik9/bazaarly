"use server";

import { z } from "zod";
import { Wishlist } from "@/lib/db/models";
import { authAction } from "@/lib/safe-action";
import { objectId } from "@/lib/validation";

export const toggleWishlistAction = authAction
  .metadata({ name: "wishlist.toggle", limit: "cart" })
  .inputSchema(z.object({ productId: objectId }))
  .action(async ({ parsedInput, ctx }) => {
    const existing = await Wishlist.findOne({ userId: ctx.user.id, products: parsedInput.productId }).select("_id").lean();
    if (existing) {
      await Wishlist.updateOne({ userId: ctx.user.id }, { $pull: { products: parsedInput.productId } });
      return { wishlisted: false };
    }
    await Wishlist.updateOne(
      { userId: ctx.user.id },
      { $addToSet: { products: parsedInput.productId } },
      { upsert: true },
    );
    return { wishlisted: true };
  });
