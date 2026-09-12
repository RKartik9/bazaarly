"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ChevronRight, Flame, Heart, Package, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import type { NavCategory } from "@/features/catalog/types";
import { Logo } from "./logo";

export function MobileNav({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="rounded-full lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle asChild>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <div className="px-3 py-3">
          <Link
            href="/deals"
            onClick={close}
            className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-3 text-sm font-semibold text-primary"
          >
            <Flame className="size-4" /> Today&apos;s deals
          </Link>
          <Accordion type="multiple" className="mt-2">
            {categories.map((cat) => (
              <AccordionItem key={cat.slug} value={cat.slug} className="border-b-0">
                <AccordionTrigger className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted hover:no-underline">
                  {cat.name}
                </AccordionTrigger>
                <AccordionContent className="pb-1 pl-3">
                  <Link href={`/c/${cat.slug}`} onClick={close} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-primary">
                    All {cat.name} <ChevronRight className="size-4" />
                  </Link>
                  {cat.children.map((child) => (
                    <Link
                      key={child.slug}
                      href={`/c/${child.slug}`}
                      onClick={close}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-muted"
                    >
                      {child.name}
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Separator className="my-3" />
          <div className="space-y-1">
            <Link href="/account/orders" onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-muted">
              <Package className="size-4 text-muted-foreground" /> My orders
            </Link>
            <Link href="/wishlist" onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-muted">
              <Heart className="size-4 text-muted-foreground" /> Wishlist
            </Link>
            <Link href="/account/addresses" onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-muted">
              <MapPin className="size-4 text-muted-foreground" /> Addresses
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
