"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/money";
import type { CartLine } from "../types";
import { useCartMutations } from "../use-cart-mutations";
import { attributeSummary } from "./cart-line-item";

export function SavedForLater({ lines }: { lines: CartLine[] }) {
  const { toggleSaved, remove, pendingSku } = useCartMutations();
  if (!lines.length) return null;

  return (
    <section>
      <h2 className="mb-4 font-heading text-xl font-bold">
        Saved for later <span className="text-sm font-normal text-muted-foreground">({lines.length})</span>
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {lines.map((line) => {
          const pending = pendingSku === line.sku;
          return (
            <li key={line.sku} className="flex gap-4 rounded-2xl bg-card p-3 shadow-soft">
              <Link href={`/p/${line.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                {line.image && <Image src={line.image} alt={line.title} fill sizes="96px" className="object-cover" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{line.brand}</p>
                <Link href={`/p/${line.slug}`} className="line-clamp-2 text-sm font-medium hover:underline">
                  {line.title}
                </Link>
                {Object.keys(line.attributes).length > 0 && <p className="mt-0.5 text-xs text-muted-foreground">{attributeSummary(line.attributes)}</p>}
                <p className="mt-1 text-sm font-bold tabular-nums">{formatPrice(line.price)}</p>
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <Button size="sm" variant="secondary" className="h-8 rounded-full" disabled={pending || line.stock <= 0} onClick={() => toggleSaved(line.sku)}>
                    {pending && <Loader2 className="size-3 animate-spin" />}
                    {line.stock <= 0 ? "Out of stock" : "Move to bag"}
                  </Button>
                  <Button size="icon-sm" variant="ghost" aria-label="Remove" disabled={pending} onClick={() => remove(line.sku)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
