"use server";

import { Product } from "@/lib/db/models";
import { AppError, NotFoundError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";
import { evaluateCoupon } from "@/features/coupons/validate";
import { clearGuestToken, ensureGuestToken, readGuestToken } from "./guest";
import { addToCartSchema, applyCouponSchema, skuOnlySchema, updateQtySchema } from "./schemas";
import { buildCartDto, findCart, findOrCreateCart, mergeGuestCartIntoUser, removeItems } from "./service";
import { computeTotals } from "./pricing";
import { hydrateLines } from "./service";

const cartAction = actionClient.use(async ({ next, ctx }) => {
  const guestToken = await readGuestToken();
  if (ctx.user && guestToken) {
    await mergeGuestCartIntoUser(ctx.user.id, guestToken);
    await clearGuestToken();
  }
  const owner = ctx.user ? { userId: ctx.user.id } : { guestToken };
  return next({ ctx: { ...ctx, owner } });
});

async function resolveOwner(owner: { userId?: string; guestToken?: string | null }) {
  if (owner.userId) return { userId: owner.userId };
  return { guestToken: owner.guestToken ?? (await ensureGuestToken()) };
}

export const addToCartAction = cartAction
  .metadata({ name: "cart.add", limit: "cart" })
  .inputSchema(addToCartSchema)
  .action(async ({ parsedInput, ctx }) => {
    const product = await Product.findOne({ _id: parsedInput.productId, status: "active" }).lean();
    const variant = product?.variants.find((v) => v.sku === parsedInput.sku);
    if (!product || !variant) throw new NotFoundError("Product");

    const available = variant.stock - (variant.reserved ?? 0);
    if (available <= 0) throw new AppError("This item is out of stock.");

    const cart = await findOrCreateCart(await resolveOwner(ctx.owner));
    const existing = cart.items.find((i) => i.sku === variant.sku);
    const nextQty = (existing?.savedForLater ? 0 : existing?.qty ?? 0) + parsedInput.qty;
    if (nextQty > available) throw new AppError(`Only ${available} left in stock.`);
    if (nextQty > 10) throw new AppError("You can add up to 10 units of an item.");

    if (existing) {
      existing.qty = nextQty;
      existing.savedForLater = false;
    } else {
      cart.items.push({ product: product._id, sku: variant.sku, qty: nextQty, savedForLater: false, addedAt: new Date() });
    }
    await cart.save();
    return buildCartDto(cart, ctx.user?.id);
  });

export const updateQtyAction = cartAction
  .metadata({ name: "cart.updateQty", limit: "cart" })
  .inputSchema(updateQtySchema)
  .action(async ({ parsedInput, ctx }) => {
    const cart = await findCart(ctx.owner);
    if (!cart) throw new NotFoundError("Cart");
    const item = cart.items.find((i) => i.sku === parsedInput.sku);
    if (!item) throw new NotFoundError("Item");

    if (parsedInput.qty === 0) {
      removeItems(cart, (i) => i.sku === parsedInput.sku);
    } else {
      const product = await Product.findById(item.product).lean();
      const variant = product?.variants.find((v) => v.sku === item.sku);
      const available = variant ? variant.stock - (variant.reserved ?? 0) : 0;
      if (parsedInput.qty > available) throw new AppError(`Only ${available} left in stock.`);
      item.qty = parsedInput.qty;
    }
    await cart.save();
    return buildCartDto(cart, ctx.user?.id);
  });

export const removeFromCartAction = cartAction
  .metadata({ name: "cart.remove", limit: "cart" })
  .inputSchema(skuOnlySchema)
  .action(async ({ parsedInput, ctx }) => {
    const cart = await findCart(ctx.owner);
    if (!cart) throw new NotFoundError("Cart");
    removeItems(cart, (i) => i.sku === parsedInput.sku);
    await cart.save();
    return buildCartDto(cart, ctx.user?.id);
  });

export const toggleSaveForLaterAction = cartAction
  .metadata({ name: "cart.saveForLater", limit: "cart" })
  .inputSchema(skuOnlySchema)
  .action(async ({ parsedInput, ctx }) => {
    const cart = await findCart(ctx.owner);
    const item = cart?.items.find((i) => i.sku === parsedInput.sku);
    if (!cart || !item) throw new NotFoundError("Item");
    item.savedForLater = !item.savedForLater;
    await cart.save();
    return buildCartDto(cart, ctx.user?.id);
  });

export const applyCouponAction = cartAction
  .metadata({ name: "cart.applyCoupon", limit: "coupon" })
  .inputSchema(applyCouponSchema)
  .action(async ({ parsedInput, ctx }) => {
    const cart = await findCart(ctx.owner);
    if (!cart || !cart.items.length) throw new AppError("Add something to your cart first.");

    const lines = (await hydrateLines(cart)).filter((l) => !l.savedForLater);
    const { subtotal } = computeTotals(lines);
    const outcome = await evaluateCoupon(parsedInput.code, subtotal, ctx.user?.id);
    if (!outcome.ok) throw new AppError(outcome.reason);

    cart.couponCode = outcome.coupon.code;
    await cart.save();
    return buildCartDto(cart, ctx.user?.id);
  });

export const removeCouponAction = cartAction
  .metadata({ name: "cart.removeCoupon", limit: "cart" })
  .action(async ({ ctx }) => {
    const cart = await findCart(ctx.owner);
    if (!cart) throw new NotFoundError("Cart");
    cart.couponCode = null;
    await cart.save();
    return buildCartDto(cart, ctx.user?.id);
  });

export const clearCartAction = cartAction
  .metadata({ name: "cart.clear", limit: "cart" })
  .action(async ({ ctx }) => {
    const cart = await findCart(ctx.owner);
    if (cart) {
      removeItems(cart, (i) => !i.savedForLater);
      cart.couponCode = null;
      await cart.save();
    }
    return buildCartDto(cart, ctx.user?.id);
  });
