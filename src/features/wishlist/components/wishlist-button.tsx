"use client";

import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useWishlist } from "../wishlist-provider";

export function WishlistButton({ productId, className, size = "md" }: { productId: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const { has, toggle } = useWishlist();
  const active = has(productId);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(productId);
      }}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "flex items-center justify-center rounded-full border bg-card/90 shadow-soft backdrop-blur transition-colors hover:bg-card",
        size === "sm" && "size-8",
        size === "md" && "size-9",
        size === "lg" && "size-12",
        active && "border-primary/40",
        className,
      )}
    >
      <motion.span
        key={String(active)}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        className="flex"
      >
        <Heart className={cn(size === "lg" ? "size-5" : "size-4", active ? "fill-primary text-primary" : "text-foreground/70")} />
      </motion.span>
    </motion.button>
  );
}
