import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

const cartItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    qty: { type: Number, required: true, min: 1, max: 10 },
    savedForLater: { type: Boolean, default: false },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    guestToken: { type: String },
    items: { type: [cartItemSchema], default: [] },
    couponCode: { type: String, uppercase: true, trim: true, default: null },
    expiresAt: { type: Date, index: { expires: 0 } },
  },
  { timestamps: true },
);

cartSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { userId: { $exists: true } } });
cartSchema.index(
  { guestToken: 1 },
  { unique: true, partialFilterExpression: { guestToken: { $exists: true } } },
);

export type CartItem = InferSchemaType<typeof cartItemSchema>;
export type CartDoc = InferSchemaType<typeof cartSchema> & { _id: Types.ObjectId };

export const Cart: Model<CartDoc> = models.Cart ?? model<CartDoc>("Cart", cartSchema);
