import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

const webhookEventSchema = new Schema(
  {
    provider: { type: String, required: true, enum: ["razorpay", "clerk"] },
    eventId: { type: String, required: true },
    type: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });
webhookEventSchema.index({ processedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export type WebhookEventDoc = InferSchemaType<typeof webhookEventSchema> & { _id: Types.ObjectId };

export const WebhookEvent: Model<WebhookEventDoc> =
  models.WebhookEvent ?? model<WebhookEventDoc>("WebhookEvent", webhookEventSchema);
