import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

import { USER_ROLES } from "../enums";

const userSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    name: { type: String, trim: true, default: "" },
    imageUrl: { type: String, default: "" },
    phone: { type: String, trim: true, default: "" },
    role: { type: String, enum: USER_ROLES, default: "customer" },
    lastSeenAt: { type: Date },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: Schema.Types.ObjectId };

export const User: Model<UserDoc> = models.User ?? model<UserDoc>("User", userSchema);
