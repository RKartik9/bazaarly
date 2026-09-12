"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Flame } from "lucide-react";
import type { NavCategory } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

export function MegaNav({ categories }: { categories: NavCategory[] }) {
  const [active, setActive] = useState<string | null>(null);
  const pathname = usePathname();
  const current = categories.find((c) => c.slug === active);

  return (
    <nav aria-label="Categories" className="relative hidden border-t border-border/60 lg:block" onMouseLeave={() => setActive(null)}>
      <div className="container-x flex h-11 items-center gap-1">
        <Link
          href="/deals"
          className="mr-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
        >
          <Flame className="size-4" />
          Deals
        </Link>
        {categories.map((cat) => {
          const isActive = active === cat.slug || pathname.startsWith(`/c/${cat.slug}`);
          return (
            <Link
              key={cat.slug}
              href={`/c/${cat.slug}`}
              onMouseEnter={() => setActive(cat.slug)}
              onFocus={() => setActive(cat.slug)}
              className={cn(
                "relative rounded-full px-3 py-1 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground",
                isActive && "text-foreground",
              )}
            >
              {cat.name}
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-muted"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <AnimatePresence>
        {current && current.children.length > 0 && (
          <motion.div
            key={current.slug}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full z-40 border-b bg-popover/95 shadow-lift backdrop-blur-md"
          >
            <div className="container-x grid grid-cols-[1.2fr_2fr] gap-8 py-6">
              <Link
                href={`/c/${current.slug}`}
                onClick={() => setActive(null)}
                className="group relative aspect-[16/9] overflow-hidden rounded-2xl"
              >
                {current.image && (
                  <Image
                    src={current.image}
                    alt={current.name}
                    fill
                    sizes="400px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-background">
                  <p className="font-heading text-xl font-bold">{current.name}</p>
                  <p className="line-clamp-2 text-xs text-background/80">{current.description}</p>
                </div>
              </Link>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Shop by category</p>
                <ul className="grid grid-cols-2 gap-1.5">
                  {current.children.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={`/c/${child.slug}`}
                        onClick={() => setActive(null)}
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                      >
                        {child.name}
                        <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={`/c/${current.slug}`}
                      onClick={() => setActive(null)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
                    >
                      View all {current.name}
                      <ArrowRight className="size-4" />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
