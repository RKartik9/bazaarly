"use server";

import { revalidatePath } from "next/cache";
import type { Types } from "mongoose";
import { Category, Product } from "@/lib/db/models";
import { AppError, NotFoundError } from "@/lib/errors";
import { adminAction } from "@/lib/safe-action";
import { categoryIdSchema, categoryInputSchema, updateCategorySchema, type CategoryInput } from "./schemas";

function revalidateCatalog(slug: string) {
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  revalidatePath(`/c/${slug}`);
}

async function validateParent(parent: string, selfId?: string) {
  if (!parent) return null;
  if (parent === selfId) throw new AppError("A category cannot be its own parent.");
  const parentDoc = await Category.findById(parent).lean();
  if (!parentDoc) throw new AppError("Parent category not found.");
  if (parentDoc.parent) throw new AppError("Only two levels of categories are supported.");
  return parentDoc._id;
}

function toDocument(input: CategoryInput, parent: Types.ObjectId | null) {
  return { ...input, parent };
}

export const createCategoryAction = adminAction
  .metadata({ name: "admin.categories.create", limit: "admin" })
  .inputSchema(categoryInputSchema)
  .action(async ({ parsedInput }) => {
    if (await Category.exists({ slug: parsedInput.slug })) throw new AppError("A category with this slug already exists.");
    const parent = await validateParent(parsedInput.parent);
    const doc = await Category.create(toDocument(parsedInput, parent));
    revalidateCatalog(doc.slug);
    return { id: doc._id.toString() };
  });

export const updateCategoryAction = adminAction
  .metadata({ name: "admin.categories.update", limit: "admin" })
  .inputSchema(updateCategorySchema)
  .action(async ({ parsedInput: { id, data } }) => {
    const category = await Category.findById(id);
    if (!category) throw new NotFoundError("Category");
    if (await Category.exists({ slug: data.slug, _id: { $ne: id } })) throw new AppError("A category with this slug already exists.");
    if (data.parent && (await Category.exists({ parent: id }))) throw new AppError("This category has sub-categories, so it must stay top-level.");
    const parent = await validateParent(data.parent, id);
    const previousSlug = category.slug;
    category.set(toDocument(data, parent));
    await category.save();

    if (previousSlug !== category.slug || String(category.parent ?? "") !== data.parent) {
      const parentDoc = category.parent ? await Category.findById(category.parent).lean() : null;
      const path = parentDoc ? [parentDoc.slug, category.slug] : [category.slug];
      await Product.updateMany({ category: id }, { categoryPath: path });
      await Category.find({ parent: id }).then((children) =>
        Promise.all(children.map((child) => Product.updateMany({ category: child._id }, { categoryPath: [category.slug, child.slug] }))),
      );
    }
    revalidateCatalog(category.slug);
    if (previousSlug !== category.slug) revalidatePath(`/c/${previousSlug}`);
    return { id };
  });

export const deleteCategoryAction = adminAction
  .metadata({ name: "admin.categories.delete", limit: "admin" })
  .inputSchema(categoryIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    const category = await Category.findById(id);
    if (!category) throw new NotFoundError("Category");
    if (await Product.exists({ category: id })) throw new AppError("Move or delete this category's products first.");
    if (await Category.exists({ parent: id })) throw new AppError("Delete or move its sub-categories first.");
    await category.deleteOne();
    revalidateCatalog(category.slug);
    return { id };
  });
