import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

const wishlistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    products: { type: [{ type: Schema.Types.ObjectId, ref: "Product" }], default: [] },
  },
  { timestamps: true },
);

export type WishlistDoc = InferSchemaType<typeof wishlistSchema> & { _id: Types.ObjectId };

export const Wishlist: Model<WishlistDoc> =
  models.Wishlist ?? model<WishlistDoc>("Wishlist", wishlistSchema);
