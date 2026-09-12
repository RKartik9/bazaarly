import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";
import { addressFields } from "./address";

import { DELIVERY_OPTIONS, ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, type OrderStatus } from "../enums";

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    brand: { type: String, default: "" },
    image: { type: String, default: "" },
    sku: { type: String, required: true },
    attributes: { type: Schema.Types.Mixed, default: {} },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const timelineSchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    address: { type: new Schema(addressFields, { _id: false }), required: true },
    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      codFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    couponCode: { type: String, default: null },
    delivery: { type: String, enum: DELIVERY_OPTIONS, default: "standard" },
    payment: {
      method: { type: String, enum: PAYMENT_METHODS, required: true },
      status: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
      razorpayOrderId: { type: String, index: true, sparse: true },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      paidAt: { type: Date },
      failureReason: { type: String },
    },
    status: { type: String, enum: ORDER_STATUSES, default: "pending", index: true },
    timeline: { type: [timelineSchema], default: [] },
    stockReleased: { type: Boolean, default: false },
    cancelReason: { type: String },
    returnReason: { type: String },
    expectedDelivery: { type: Date },
  },
  { timestamps: true },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

type InferredOrder = InferSchemaType<typeof orderSchema>;

export type OrderItem = InferSchemaType<typeof orderItemSchema> & {
  attributes: Record<string, string>;
};
export type OrderPayment = NonNullable<InferredOrder["payment"]>;
export type OrderPricing = NonNullable<InferredOrder["pricing"]>;
export type OrderTimelineEntry = { status: OrderStatus; note: string; at: Date };

export type OrderDoc = Omit<InferredOrder, "items" | "payment" | "pricing" | "timeline"> & {
  _id: Types.ObjectId;
  items: OrderItem[];
  payment: OrderPayment;
  pricing: OrderPricing;
  timeline: OrderTimelineEntry[];
};

export const Order: Model<OrderDoc> = models.Order ?? model<OrderDoc>("Order", orderSchema);
