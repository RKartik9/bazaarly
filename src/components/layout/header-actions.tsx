"use client";

import Link from "next/link";
import { Heart, ShoppingBag, UserRound, LayoutDashboard } from "lucide-react";
import { Show, UserButton, SignInButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCart } from "@/features/cart/cart-provider";

export function HeaderActions({ isAdmin }: { isAdmin: boolean }) {
  const { cart, openCart } = useCart();
  const count = cart.totals.itemCount;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {isAdmin && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon-lg" className="hidden rounded-full sm:inline-flex">
              <Link href="/admin" aria-label="Admin dashboard">
                <LayoutDashboard className="size-5" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Admin</TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="ghost" size="icon-lg" className="rounded-full">
            <Link href="/wishlist" aria-label="Wishlist">
              <Heart className="size-5" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Wishlist</TooltipContent>
      </Tooltip>

      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button variant="ghost" size="lg" className="rounded-full">
            <UserRound className="size-5" />
            <span className="hidden sm:inline">Sign in</span>
          </Button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <div className="flex items-center px-1">
          <UserButton
            appearance={{ elements: { avatarBox: "size-9 ring-2 ring-primary/30" } }}
            userProfileMode="navigation"
            userProfileUrl="/account/profile"
          >
            <UserButton.MenuItems>
              <UserButton.Link label="My orders" href="/account/orders" labelIcon={<ShoppingBag className="size-4" />} />
              <UserButton.Link label="Addresses" href="/account/addresses" labelIcon={<UserRound className="size-4" />} />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </Show>

      <Button variant="ink" size="lg" onClick={openCart} className="relative rounded-full" aria-label={`Cart, ${count} items`}>
        <ShoppingBag className="size-5" />
        <span className="hidden sm:inline">Cart</span>
        <AnimatePresence mode="popLayout">
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow"
            >
              {count > 9 ? "9+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
}
