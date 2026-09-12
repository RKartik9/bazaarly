"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/countdown";
import { QuantityStepper } from "@/features/cart/components/quantity-stepper";
import { useCartMutations } from "@/features/cart/use-cart-mutations";
import type { ProductDetailDto, ProductVariantDto } from "@/features/catalog/types";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";
import { discountPercent, formatPrice } from "@/lib/money";
import { PincodeCheck } from "./pincode-check";
import { VariantPicker } from "./variant-picker";

type Props = {
  product: ProductDetailDto;
  selected: ProductVariantDto | null;
  selection: Record<string, string>;
  optionsFor: (axis: string) => { value: string; available: boolean; exists: boolean; image: string }[];
  onSelect: (axis: string, value: string) => void;
};

export function BuyBox({ product, selected, selection, optionsFor, onSelect }: Props) {
  const router = useRouter();
  const { add, pendingSku } = useCartMutations();
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);

  const price = selected?.price ?? product.price;
  const mrp = selected?.mrp ?? product.mrp;
  const off = discountPercent(price, mrp);
  const stock = selected?.stock ?? 0;
  const canBuy = !!selected && stock > 0;
  const busy = pendingSku === selected?.sku;

  const addToCart = () => (selected ? add({ productId: product.id, sku: selected.sku, qty }) : Promise.resolve(false));

  const buyNow = async () => {
    if (!selected) return;
    setBuying(true);
    const ok = await add({ productId: product.id, sku: selected.sku, qty }, { open: false });
    setBuying(false);
    if (ok) router.push("/checkout");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
        <span className="font-heading text-4xl font-extrabold tabular-nums">{formatPrice(price)}</span>
        {mrp > price && (
          <>
            <span className="strike-price text-lg text-muted-foreground tabular-nums">{formatPrice(mrp)}</span>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-sm font-bold text-success">{off}% off</span>
          </>
        )}
        <span className="w-full text-xs text-muted-foreground">Inclusive of all taxes</span>
      </div>

      {product.isDeal && product.dealEndsAt && (
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary/15 to-saffron/25 px-4 py-3">
          <Zap className="size-4 text-primary" />
          <span className="text-sm font-semibold">Deal ends in</span>
          <Countdown until={product.dealEndsAt} compact />
        </div>
      )}

      {product.variantAxes.map((axis) => (
        <VariantPicker key={axis} axis={axis} options={optionsFor(axis)} value={selection[axis]} onSelect={(v) => onSelect(axis, v)} />
      ))}

      <div className="flex items-center gap-4">
        <QuantityStepper value={qty} onChange={setQty} max={Math.min(10, Math.max(1, stock))} />
        <p className="text-sm">
          {!selected ? (
            <span className="text-muted-foreground">Select options</span>
          ) : stock <= 0 ? (
            <span className="font-semibold text-destructive">Out of stock</span>
          ) : stock <= 5 ? (
            <span className="font-semibold text-primary">Only {stock} left</span>
          ) : (
            <span className="text-success">In stock</span>
          )}
        </p>
      </div>

      <div className="flex gap-3">
        <Button size="xl" variant="outline" className="flex-1 rounded-xl" disabled={!canBuy || busy} onClick={addToCart}>
          {busy && !buying ? <Loader2 className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}
          Add to cart
        </Button>
        <Button size="xl" className="flex-1 rounded-xl" disabled={!canBuy || busy} onClick={buyNow}>
          {buying ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
          Buy now
        </Button>
        <WishlistButton productId={product.id} size="lg" className="shrink-0 border-border" />
      </div>

      <PincodeCheck />
    </div>
  );
}
