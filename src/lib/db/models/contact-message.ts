import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

const contactMessageSchema = new Schema(
  {
    userId: { type: String, default: null, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    topic: { type: String, required: true },
    orderNumber: { type: String, default: null },
    message: { type: String, required: true },
    status: { type: String, enum: ["open", "resolved"], default: "open", index: true },
  },
  { timestamps: true },
);

export type ContactMessageDoc = InferSchemaType<typeof contactMessageSchema> & { _id: Types.ObjectId };

export const ContactMessage: Model<ContactMessageDoc> =
  models.ContactMessage ?? model<ContactMessageDoc>("ContactMessage", contactMessageSchema);
