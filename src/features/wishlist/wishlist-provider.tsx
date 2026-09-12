"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { toggleWishlistAction } from "./actions";

type WishlistContextValue = {
  ids: Set<string>;
  has: (id: string) => boolean;
  toggle: (id: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ initialIds, signedIn, children }: { initialIds: string[]; signedIn: boolean; children: React.ReactNode }) {
  const [ids, setIds] = useState(() => new Set(initialIds));
  const clerk = useClerk();

  const [seenInitial, setSeenInitial] = useState(initialIds);

  if (initialIds !== seenInitial) {
    setSeenInitial(initialIds);
    setIds(new Set(initialIds));
  }

  const toggle = useCallback(
    async (id: string) => {
      if (!signedIn) {
        clerk.openSignIn({ fallbackRedirectUrl: window.location.href });
        return;
      }
      const wasIn = ids.has(id);
      setIds((prev) => {
        const next = new Set(prev);
        if (wasIn) next.delete(id);
        else next.add(id);
        return next;
      });
      const result = await toggleWishlistAction({ productId: id });
      if (result.serverError || !result.data) {
        setIds((prev) => {
          const next = new Set(prev);
          if (wasIn) next.add(id);
          else next.delete(id);
          return next;
        });
        toast.error(result.serverError ?? "Couldn't update wishlist");
        return;
      }
      toast.success(result.data.wishlisted ? "Saved to wishlist" : "Removed from wishlist");
    },
    [ids, signedIn, clerk],
  );

  const value = useMemo(() => ({ ids, has: (id: string) => ids.has(id), toggle }), [ids, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
