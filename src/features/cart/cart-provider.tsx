"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { emptyCart, type CartDto } from "./types";

type CartContextValue = {
  cart: CartDto;
  setCart: (cart: CartDto) => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ initialCart, children }: { initialCart: CartDto | null; children: React.ReactNode }) {
  const [cart, setCart] = useState<CartDto>(initialCart ?? emptyCart);
  const [isOpen, setOpen] = useState(false);
  const [seenInitial, setSeenInitial] = useState(initialCart);

  if (initialCart !== seenInitial) {
    setSeenInitial(initialCart);
    if (initialCart) setCart(initialCart);
  }

  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ cart, setCart, isOpen, openCart, closeCart }), [cart, isOpen, openCart, closeCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
