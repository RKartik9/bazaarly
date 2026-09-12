"use server";

import { revalidatePath } from "next/cache";
import { Address } from "@/lib/db/models";
import { AppError, NotFoundError } from "@/lib/errors";
import { authAction } from "@/lib/safe-action";
import { toAddressDto } from "./queries";
import { addressIdSchema, addressInputSchema, updateAddressSchema } from "./schemas";

const MAX_ADDRESSES = 10;

function revalidate() {
  revalidatePath("/account/addresses");
  revalidatePath("/checkout", "layout");
}

async function clearDefault(userId: string, exceptId?: string) {
  await Address.updateMany({ userId, ...(exceptId ? { _id: { $ne: exceptId } } : {}), isDefault: true }, { $set: { isDefault: false } });
}

export const createAddressAction = authAction
  .metadata({ name: "addresses.create", limit: "action" })
  .inputSchema(addressInputSchema)
  .action(async ({ parsedInput, ctx }) => {
    const count = await Address.countDocuments({ userId: ctx.user.id });
    if (count >= MAX_ADDRESSES) throw new AppError(`You can save up to ${MAX_ADDRESSES} addresses.`);
    const makeDefault = parsedInput.isDefault || count === 0;
    if (makeDefault) await clearDefault(ctx.user.id);
    const doc = await Address.create({ ...parsedInput, isDefault: makeDefault, userId: ctx.user.id });
    revalidate();
    return toAddressDto(doc.toObject());
  });

export const updateAddressAction = authAction
  .metadata({ name: "addresses.update", limit: "action" })
  .inputSchema(updateAddressSchema)
  .action(async ({ parsedInput: { id, ...input }, ctx }) => {
    if (input.isDefault) await clearDefault(ctx.user.id, id);
    const doc = await Address.findOneAndUpdate({ _id: id, userId: ctx.user.id }, { $set: input }, { new: true }).lean();
    if (!doc) throw new NotFoundError("Address");
    revalidate();
    return toAddressDto(doc);
  });

export const deleteAddressAction = authAction
  .metadata({ name: "addresses.delete", limit: "action" })
  .inputSchema(addressIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    const doc = await Address.findOneAndDelete({ _id: parsedInput.id, userId: ctx.user.id }).lean();
    if (!doc) throw new NotFoundError("Address");
    if (doc.isDefault) {
      const next = await Address.findOne({ userId: ctx.user.id }).sort({ updatedAt: -1 });
      if (next) await next.updateOne({ $set: { isDefault: true } });
    }
    revalidate();
    return { id: parsedInput.id };
  });

export const setDefaultAddressAction = authAction
  .metadata({ name: "addresses.setDefault", limit: "action" })
  .inputSchema(addressIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    const exists = await Address.exists({ _id: parsedInput.id, userId: ctx.user.id });
    if (!exists) throw new NotFoundError("Address");
    await clearDefault(ctx.user.id, parsedInput.id);
    await Address.updateOne({ _id: parsedInput.id }, { $set: { isDefault: true } });
    revalidate();
    return { id: parsedInput.id };
  });
