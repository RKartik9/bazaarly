"use client";

import Link from "next/link";
import { Check, Loader2, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCart } from "@/features/cart/cart-provider";
import { useCartMutations } from "@/features/cart/use-cart-mutations";
import type { ProductCardDto, QuickOption } from "@/features/catalog/types";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

type Props = { product: ProductCardDto; className?: string };

export function QuickAddButton({ product, className }: Props) {
  const { add, pendingSku } = useCartMutations();
  const { openCart } = useCart();
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  const inStock = product.options.filter((o) => o.stock > 0);
  const busy = pendingSku !== null && product.options.some((o) => o.sku === pendingSku);

  const addSku = async (sku: string) => {
    const ok = await add({ productId: product.id, sku, qty: 1 }, { open: false });
    if (!ok) return;
    setOpen(false);
    setAdded(true);
    toast.success("Added to your bag", { action: { label: "View bag", onClick: openCart } });
  };

  const buttonClass = cn("w-full rounded-full", className);
  const icon = busy ? <Loader2 className="size-3.5 animate-spin" /> : added ? <Check className="size-3.5" /> : <ShoppingBag className="size-3.5" />;
  const label = added ? "Added" : "Add to cart";

  if (inStock.length === 0) {
    return (
      <Button size="sm" variant="outline" disabled className={buttonClass}>
        Sold out
      </Button>
    );
  }

  if (product.options.length === 1) {
    return (
      <Button size="sm" variant={added ? "secondary" : "default"} disabled={busy} className={buttonClass} onClick={() => addSku(inStock[0].sku)}>
        {icon} {label}
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant={added ? "secondary" : "default"} disabled={busy} className={buttonClass}>
          {icon} {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" sideOffset={8} className="w-64 rounded-2xl p-3">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Pick an option</p>
        <OptionList options={product.options} pendingSku={pendingSku} onPick={addSku} />
        <Link href={`/p/${product.slug}`} className="mt-3 block text-center text-xs font-medium text-primary hover:underline">
          View full details
        </Link>
      </PopoverContent>
    </Popover>
  );
}

function OptionList({ options, pendingSku, onPick }: { options: QuickOption[]; pendingSku: string | null; onPick: (sku: string) => void }) {
  return (
    <ul className="max-h-56 space-y-1 overflow-y-auto">
      {options.map((o) => {
        const out = o.stock <= 0;
        const loading = pendingSku === o.sku;
        return (
          <li key={o.sku}>
            <button
              type="button"
              disabled={out || pendingSku !== null}
              onClick={() => onPick(o.sku)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
                out ? "text-muted-foreground line-through opacity-60" : "hover:bg-primary/10",
              )}
            >
              <span className="truncate font-medium">{o.label}</span>
              <span className="ml-2 flex shrink-0 items-center gap-2 text-xs tabular-nums text-muted-foreground">
                {out ? "Sold out" : formatPrice(o.price)}
                {loading && <Loader2 className="size-3 animate-spin" />}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
