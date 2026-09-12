"use server";

import { revalidatePath } from "next/cache";
import { Order, Product, Review } from "@/lib/db/models";
import { AppError } from "@/lib/errors";
import { authAction } from "@/lib/safe-action";
import { createReviewSchema } from "./schemas";

async function refreshProductRating(productId: string) {
  const [row] = await Review.aggregate<{ avg: number; count: number }>([
    { $match: { product: Review.base.Types.ObjectId.createFromHexString(productId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Product.updateOne(
    { _id: productId },
    { $set: { "rating.avg": row ? Math.round(row.avg * 10) / 10 : 0, "rating.count": row?.count ?? 0 } },
  );
}

export const createReviewAction = authAction
  .metadata({ name: "reviews.create", limit: "review" })
  .inputSchema(createReviewSchema)
  .action(async ({ parsedInput, ctx }) => {
    const product = await Product.findById(parsedInput.productId).select("slug").lean();
    if (!product) throw new AppError("Product not found");

    const existing = await Review.exists({ product: parsedInput.productId, userId: ctx.user.id });
    if (existing) throw new AppError("You've already reviewed this product");

    const purchased = await Order.exists({
      userId: ctx.user.id,
      "items.product": parsedInput.productId,
      status: { $in: ["confirmed", "packed", "shipped", "delivered"] },
    });

    await Review.create({
      product: parsedInput.productId,
      userId: ctx.user.id,
      authorName: ctx.user.name || "Bazaarly shopper",
      rating: parsedInput.rating,
      title: parsedInput.title,
      body: parsedInput.body,
      verifiedPurchase: !!purchased,
    });
    await refreshProductRating(parsedInput.productId);
    revalidatePath(`/p/${product.slug}`);
    return { ok: true };
  });
