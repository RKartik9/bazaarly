import "server-only";
import type { Types } from "mongoose";
import { Cart, Product, type CartDoc } from "@/lib/db/models";
import { evaluateCoupon } from "@/features/coupons/validate";
import { computeTotals } from "./pricing";
import { emptyCart, type CartDto, type CartLine } from "./types";

type Owner = { userId?: string | null; guestToken?: string | null };

const GUEST_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export function ownerFilter({ userId, guestToken }: Owner) {
  if (userId) return { userId };
  if (guestToken) return { guestToken };
  return null;
}

export async function findCart(owner: Owner) {
  const filter = ownerFilter(owner);
  if (!filter) return null;
  return Cart.findOne(filter);
}

export async function findOrCreateCart(owner: Owner) {
  const existing = await findCart(owner);
  if (existing) return existing;
  const filter = ownerFilter(owner);
  if (!filter) throw new Error("Cart owner is required");
  return Cart.create({
    ...filter,
    items: [],
    expiresAt: owner.userId ? undefined : new Date(Date.now() + GUEST_TTL_MS),
  });
}

export function removeItems(cart: CartDoc & { items: CartDoc["items"] }, predicate: (item: CartDoc["items"][number]) => boolean) {
  for (let i = cart.items.length - 1; i >= 0; i--) {
    if (predicate(cart.items[i]!)) cart.items.splice(i, 1);
  }
}

export async function mergeGuestCartIntoUser(userId: string, guestToken: string) {
  const guest = await Cart.findOne({ guestToken });
  if (!guest) return;
  if (!guest.items.length) {
    await guest.deleteOne();
    return;
  }

  const userCart = await findOrCreateCart({ userId });
  for (const item of guest.items) {
    const match = userCart.items.find((i) => i.sku === item.sku);
    if (match) match.qty = Math.min(10, match.qty + item.qty);
    else userCart.items.push(item);
  }
  if (!userCart.couponCode && guest.couponCode) userCart.couponCode = guest.couponCode;
  await userCart.save();
  await guest.deleteOne();
}

export async function hydrateLines(cart: CartDoc | null): Promise<CartLine[]> {
  if (!cart || !cart.items.length) return [];
  const ids = [...new Set(cart.items.map((i) => i.product.toString()))];
  const products = await Product.find({ _id: { $in: ids }, status: "active" }).lean();
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const lines: CartLine[] = [];
  for (const item of cart.items) {
    const product = byId.get(item.product.toString());
    const variant = product?.variants.find((v) => v.sku === item.sku);
    if (!product || !variant) continue;
    lines.push({
      productId: product._id.toString(),
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      image: variant.image || product.images[0] || "",
      sku: variant.sku,
      attributes: variant.attributes ?? {},
      price: variant.price,
      mrp: variant.mrp,
      qty: item.qty,
      stock: Math.max(0, variant.stock - (variant.reserved ?? 0)),
      savedForLater: item.savedForLater,
    });
  }
  return lines;
}

export async function buildCartDto(cart: CartDoc | null, userId?: string | null): Promise<CartDto> {
  if (!cart) return emptyCart;
  const allLines = await hydrateLines(cart);
  const lines = allLines.filter((l) => !l.savedForLater);
  const saved = allLines.filter((l) => l.savedForLater);
  const base = computeTotals(lines);

  let coupon: CartDto["coupon"] = null;
  let couponError: string | null = null;
  let couponDiscount = 0;
  let freeShipping = false;

  if (cart.couponCode && lines.length) {
    const outcome = await evaluateCoupon(cart.couponCode, base.subtotal, userId);
    if (outcome.ok) {
      couponDiscount = outcome.discount;
      freeShipping = outcome.freeShipping;
      coupon = {
        code: outcome.coupon.code,
        description: outcome.coupon.description,
        discount: outcome.discount,
        freeShipping: outcome.freeShipping,
      };
    } else {
      couponError = outcome.reason;
    }
  }

  return {
    id: (cart._id as Types.ObjectId).toString(),
    lines,
    saved,
    coupon,
    couponError,
    totals: computeTotals(lines, couponDiscount, freeShipping),
  };
}
