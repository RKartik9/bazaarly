"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  addToCartAction,
  applyCouponAction,
  clearCartAction,
  removeCouponAction,
  removeFromCartAction,
  toggleSaveForLaterAction,
  updateQtyAction,
} from "./actions";
import { useCart } from "./cart-provider";
import type { AddToCartInput } from "./schemas";
import type { CartDto } from "./types";

type ActionResult = { data?: CartDto; serverError?: string; validationErrors?: unknown };

export function useCartMutations() {
  const { setCart, openCart } = useCart();
  const [pendingSku, setPendingSku] = useState<string | null>(null);

  const run = useCallback(
    async (promise: Promise<ActionResult>, sku: string | null, successMessage?: string) => {
      setPendingSku(sku);
      try {
        const result = await promise;
        if (result.serverError) {
          toast.error(result.serverError);
          return false;
        }
        if (result.validationErrors) {
          toast.error("That request wasn't valid.");
          return false;
        }
        if (result.data) setCart(result.data);
        if (successMessage) toast.success(successMessage);
        return true;
      } finally {
        setPendingSku(null);
      }
    },
    [setCart],
  );

  return {
    pendingSku,
    add: async (input: AddToCartInput, { open = true } = {}) => {
      const ok = await run(addToCartAction(input), input.sku);
      if (ok && open) openCart();
      return ok;
    },
    updateQty: (sku: string, qty: number) => run(updateQtyAction({ sku, qty }), sku),
    remove: (sku: string) => run(removeFromCartAction({ sku }), sku, "Removed from cart"),
    toggleSaved: (sku: string) => run(toggleSaveForLaterAction({ sku }), sku),
    applyCoupon: (code: string) => run(applyCouponAction({ code }), null, "Coupon applied"),
    removeCoupon: () => run(removeCouponAction(), null),
    clear: () => run(clearCartAction(), null),
  };
}
