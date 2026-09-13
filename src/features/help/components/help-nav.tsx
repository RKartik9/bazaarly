"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = { links: ReadonlyArray<{ href: string; label: string }> };

export function HelpNav({ links }: Props) {
  const pathname = usePathname();

  return (
    <nav aria-label="Help topics" className="flex gap-1 overflow-x-auto lg:flex-col">
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors lg:rounded-2xl",
              active ? "text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {active && <motion.span layoutId="help-nav-pill" className="absolute inset-0 -z-10 rounded-full bg-primary lg:rounded-2xl" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
