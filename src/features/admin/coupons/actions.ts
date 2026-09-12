"use server";

import { revalidatePath } from "next/cache";
import { Coupon } from "@/lib/db/models";
import { AppError, NotFoundError } from "@/lib/errors";
import { adminAction } from "@/lib/safe-action";
import { couponIdSchema, couponInputSchema, toggleCouponSchema, updateCouponSchema, type CouponInput } from "./schemas";

function toDocument(input: CouponInput) {
  return {
    ...input,
    startsAt: input.startsAt ? new Date(input.startsAt) : new Date(),
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  };
}

const revalidate = () => {
  revalidatePath("/admin/coupons");
  revalidatePath("/cart");
  revalidatePath("/checkout", "layout");
};

export const createCouponAction = adminAction
  .metadata({ name: "admin.coupons.create", limit: "admin" })
  .inputSchema(couponInputSchema)
  .action(async ({ parsedInput }) => {
    if (await Coupon.exists({ code: parsedInput.code })) throw new AppError("That code is already in use.");
    const doc = await Coupon.create(toDocument(parsedInput));
    revalidate();
    return { id: doc._id.toString() };
  });

export const updateCouponAction = adminAction
  .metadata({ name: "admin.coupons.update", limit: "admin" })
  .inputSchema(updateCouponSchema)
  .action(async ({ parsedInput: { id, data } }) => {
    if (await Coupon.exists({ code: data.code, _id: { $ne: id } })) throw new AppError("That code is already in use.");
    const doc = await Coupon.findByIdAndUpdate(id, toDocument(data), { returnDocument: "after", runValidators: true });
    if (!doc) throw new NotFoundError("Coupon");
    revalidate();
    return { id };
  });

export const toggleCouponAction = adminAction
  .metadata({ name: "admin.coupons.toggle", limit: "admin" })
  .inputSchema(toggleCouponSchema)
  .action(async ({ parsedInput: { id, isActive } }) => {
    const doc = await Coupon.findByIdAndUpdate(id, { isActive }, { returnDocument: "after" });
    if (!doc) throw new NotFoundError("Coupon");
    revalidate();
    return { isActive };
  });

export const deleteCouponAction = adminAction
  .metadata({ name: "admin.coupons.delete", limit: "admin" })
  .inputSchema(couponIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    const doc = await Coupon.findByIdAndDelete(id);
    if (!doc) throw new NotFoundError("Coupon");
    revalidate();
    return { id };
  });
