"use server";

import { revalidatePath } from "next/cache";
import { Category, Product } from "@/lib/db/models";
import { AppError, NotFoundError } from "@/lib/errors";
import { signUpload } from "@/lib/cloudinary";
import { adminAction } from "@/lib/safe-action";
import { bulkStockSchema, productIdSchema, productInputSchema, setStatusSchema, updateProductSchema, uploadSignatureSchema, type ProductInput } from "./schemas";

async function categoryPathFor(categoryId: string) {
  const category = await Category.findById(categoryId).lean();
  if (!category) throw new AppError("Category not found.");
  if (!category.parent) return [category.slug];
  const parent = await Category.findById(category.parent).lean();
  return parent ? [parent.slug, category.slug] : [category.slug];
}

function toDocument(input: ProductInput) {
  const { specs, dealEndsAt, ...rest } = input;
  return {
    ...rest,
    specs: Object.fromEntries(specs.map((s) => [s.key, s.value])),
    dealEndsAt: dealEndsAt ? new Date(dealEndsAt) : null,
  };
}

async function assertUnique(input: ProductInput, excludeId?: string) {
  const skus = input.variants.map((v) => v.sku);
  if (new Set(skus).size !== skus.length) throw new AppError("Variant SKUs must be unique.");
  const exclude = excludeId ? { _id: { $ne: excludeId } } : {};
  const clash = await Product.findOne({ ...exclude, $or: [{ slug: input.slug }, { "variants.sku": { $in: skus } }] }, { slug: 1, "variants.sku": 1 }).lean();
  if (!clash) return;
  if (clash.slug === input.slug) throw new AppError("A product with this slug already exists.");
  throw new AppError("One of these SKUs is already used by another product.");
}

function revalidateProduct(slug: string, previousSlug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  revalidatePath(`/p/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/p/${previousSlug}`);
}

export const createProductAction = adminAction
  .metadata({ name: "admin.products.create", limit: "admin" })
  .inputSchema(productInputSchema)
  .action(async ({ parsedInput }) => {
    await assertUnique(parsedInput);
    const categoryPath = await categoryPathFor(parsedInput.category);
    const doc = await Product.create({ ...toDocument(parsedInput), categoryPath, basePrice: 0, baseMrp: 0 });
    revalidateProduct(doc.slug);
    return { id: doc._id.toString() };
  });

export const updateProductAction = adminAction
  .metadata({ name: "admin.products.update", limit: "admin" })
  .inputSchema(updateProductSchema)
  .action(async ({ parsedInput: { id, data } }) => {
    const product = await Product.findById(id);
    if (!product) throw new NotFoundError("Product");
    await assertUnique(data, id);
    const previousSlug = product.slug;
    const categoryPath = await categoryPathFor(data.category);
    const reservedBySku = new Map(product.variants.map((v) => [v.sku, v.reserved]));
    const next = toDocument(data);

    product.set({
      ...next,
      categoryPath,
      variants: next.variants.map((v) => ({ ...v, reserved: reservedBySku.get(v.sku) ?? 0 })),
    });
    await product.save();
    revalidateProduct(product.slug, previousSlug);
    return { id };
  });

export const setProductStatusAction = adminAction
  .metadata({ name: "admin.products.status", limit: "admin" })
  .inputSchema(setStatusSchema)
  .action(async ({ parsedInput: { id, status } }) => {
    const product = await Product.findByIdAndUpdate(id, { status }, { returnDocument: "after" }).lean();
    if (!product) throw new NotFoundError("Product");
    revalidateProduct(product.slug);
    return { status };
  });

export const deleteProductAction = adminAction
  .metadata({ name: "admin.products.delete", limit: "admin" })
  .inputSchema(productIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    const product = await Product.findById(id);
    if (!product) throw new NotFoundError("Product");
    if (product.soldCount > 0) {
      product.status = "archived";
      await product.save();
      revalidateProduct(product.slug);
      return { archived: true };
    }
    await product.deleteOne();
    revalidateProduct(product.slug);
    return { archived: false };
  });

export const bulkStockAction = adminAction
  .metadata({ name: "admin.products.bulkStock", limit: "admin" })
  .inputSchema(bulkStockSchema)
  .action(async ({ parsedInput: { updates } }) => {
    const bySku = new Map(updates.map((u) => [u.sku, u.stock]));
    const products = await Product.find({ "variants.sku": { $in: [...bySku.keys()] } });
    let touched = 0;
    for (const product of products) {
      for (const variant of product.variants) {
        const stock = bySku.get(variant.sku);
        if (stock === undefined) continue;
        variant.stock = stock;
        bySku.delete(variant.sku);
        touched++;
      }
      await product.save();
    }
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath("/", "layout");
    return { updated: touched, unknown: [...bySku.keys()] };
  });

export const getUploadSignatureAction = adminAction
  .metadata({ name: "admin.uploads.sign", limit: "admin" })
  .inputSchema(uploadSignatureSchema)
  .action(async ({ parsedInput: { folder } }) => signUpload(folder));
