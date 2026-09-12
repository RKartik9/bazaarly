import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

import { ADDRESS_TYPES } from "../enums";

export const addressFields = {
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  line1: { type: String, required: true, trim: true },
  line2: { type: String, trim: true, default: "" },
  landmark: { type: String, trim: true, default: "" },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  country: { type: String, default: "India" },
  type: { type: String, enum: ADDRESS_TYPES, default: "home" },
} as const;

const addressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ...addressFields,
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type AddressDoc = InferSchemaType<typeof addressSchema> & { _id: Types.ObjectId };

export const Address: Model<AddressDoc> =
  models.Address ?? model<AddressDoc>("Address", addressSchema);
