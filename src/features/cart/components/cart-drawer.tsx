"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatPrice } from "@/lib/money";
import { useCart } from "../cart-provider";
import { CartLineItem } from "./cart-line-item";
import { FreeShippingBar } from "./free-shipping-bar";

export function CartDrawer() {
  const { cart, isOpen, closeCart } = useCart();
  const { lines, totals } = cart;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-heading text-xl">
            <ShoppingBag className="size-5 text-primary" />
            Your bag
            {totals.itemCount > 0 && <span className="text-sm font-normal text-muted-foreground">({totals.itemCount})</span>}
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <EmptyState onClose={closeCart} />
        ) : (
          <>
            <div className="px-5 pt-4">
              <FreeShippingBar remaining={totals.freeShippingRemaining} />
            </div>
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <CartLineItem key={line.sku} line={line} compact onNavigate={closeCart} />
                ))}
              </AnimatePresence>
            </ul>
            <SheetFooter className="border-t bg-muted/40 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-heading text-lg font-bold">{formatPrice(totals.subtotal - totals.couponDiscount)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Delivery and coupons are calculated at checkout.</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="xl" onClick={closeCart}>
                  <Link href="/cart">View bag</Link>
                </Button>
                <Button asChild size="xl" onClick={closeCart}>
                  <Link href="/checkout">
                    Checkout <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-blush">
        <ShoppingBag className="size-9 text-primary" />
      </div>
      <div>
        <p className="font-heading text-xl font-semibold">Your bag is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">Fill it with things you&apos;ll love. Deals are waiting.</p>
      </div>
      <Button asChild size="xl" onClick={onClose}>
        <Link href="/deals">Explore today&apos;s deals</Link>
      </Button>
    </div>
  );
}
