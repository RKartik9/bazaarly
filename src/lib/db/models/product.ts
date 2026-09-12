import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

import { PRODUCT_STATUSES } from "../enums";

const variantSchema = new Schema(
  {
    sku: { type: String, required: true, trim: true, uppercase: true },
    attributes: { type: Schema.Types.Mixed, default: {} },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    image: { type: String, default: "" },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    categoryPath: { type: [String], default: [], index: true },
    description: { type: String, default: "" },
    highlights: { type: [String], default: [] },
    specs: { type: Schema.Types.Mixed, default: {} },
    images: { type: [String], default: [] },
    variants: { type: [variantSchema], default: [] },
    variantAxes: { type: [String], default: [] },
    basePrice: { type: Number, required: true, min: 0, index: true },
    baseMrp: { type: Number, required: true, min: 0 },
    totalStock: { type: Number, default: 0 },
    rating: {
      avg: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    tags: { type: [String], default: [], index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isDeal: { type: Boolean, default: false },
    dealEndsAt: { type: Date },
    soldCount: { type: Number, default: 0 },
    status: { type: String, enum: PRODUCT_STATUSES, default: "active", index: true },
  },
  { timestamps: true },
);

productSchema.index(
  { title: "text", brand: "text", description: "text", tags: "text" },
  { weights: { title: 10, brand: 6, tags: 4, description: 1 }, name: "product_text" },
);
productSchema.index({ "variants.sku": 1 }, { unique: true, sparse: true });
productSchema.index({ category: 1, status: 1, basePrice: 1 });

productSchema.pre("validate", function syncDerivedFields() {
  if (this.variants.length) {
    const prices = this.variants.map((v) => v.price);
    const mrps = this.variants.map((v) => v.mrp);
    this.basePrice = Math.min(...prices);
    this.baseMrp = Math.max(...mrps);
    this.totalStock = this.variants.reduce((sum, v) => sum + v.stock, 0);
  }
});

export type ProductVariant = InferSchemaType<typeof variantSchema> & {
  attributes: Record<string, string>;
};

export type ProductDoc = Omit<InferSchemaType<typeof productSchema>, "variants" | "specs"> & {
  _id: Types.ObjectId;
  variants: ProductVariant[];
  specs: Record<string, string>;
};

export const Product: Model<ProductDoc> =
  models.Product ?? model<ProductDoc>("Product", productSchema);
