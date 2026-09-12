import "server-only";
import { getSessionUser } from "@/lib/auth/current-user";
import { connectDb } from "@/lib/db/mongoose";
import { Order, Review, type ReviewDoc } from "@/lib/db/models";
import type { ReviewDto, ReviewSummary } from "./types";

function toReviewDto(doc: ReviewDoc): ReviewDto {
  return {
    id: doc._id.toString(),
    authorName: doc.authorName,
    rating: doc.rating,
    title: doc.title,
    body: doc.body,
    verifiedPurchase: doc.verifiedPurchase ?? false,
    helpful: doc.helpful ?? 0,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function getProductReviews(productId: string, limit = 10): Promise<ReviewDto[]> {
  await connectDb();
  const docs = await Review.find({ product: productId }).sort({ helpful: -1, createdAt: -1 }).limit(limit).lean();
  return docs.map(toReviewDto);
}

export async function getReviewSummary(productId: string): Promise<ReviewSummary> {
  await connectDb();
  const rows = await Review.aggregate<{ _id: number; count: number }>([
    { $match: { product: Review.base.Types.ObjectId.createFromHexString(productId) } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
  ]);
  const distribution: ReviewSummary["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let weighted = 0;
  for (const row of rows) {
    const star = row._id as 1 | 2 | 3 | 4 | 5;
    distribution[star] = row.count;
    total += row.count;
    weighted += row.count * star;
  }
  return { avg: total ? Math.round((weighted / total) * 10) / 10 : 0, count: total, distribution };
}

export type ReviewEligibility = { state: "signed-out" } | { state: "reviewed" } | { state: "eligible"; verified: boolean };

export async function getReviewEligibility(productId: string): Promise<ReviewEligibility> {
  const user = await getSessionUser();
  if (!user) return { state: "signed-out" };
  await connectDb();
  const [existing, purchased] = await Promise.all([
    Review.exists({ product: productId, userId: user.id }),
    Order.exists({ userId: user.id, "items.product": productId, status: { $in: ["delivered", "shipped", "confirmed", "packed"] } }),
  ]);
  if (existing) return { state: "reviewed" };
  return { state: "eligible", verified: !!purchased };
}
