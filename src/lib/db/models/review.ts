import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

const reviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    verifiedPurchase: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true },
);

reviewSchema.index({ product: 1, userId: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

export type ReviewDoc = InferSchemaType<typeof reviewSchema> & { _id: Types.ObjectId };

export const Review: Model<ReviewDoc> = models.Review ?? model<ReviewDoc>("Review", reviewSchema);
