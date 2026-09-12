"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MapPin, Package, UserRound } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/profile", label: "Profile", icon: UserRound },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col" aria-label="Account">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
              active ? "text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {active && <motion.span layoutId="account-nav-pill" className="absolute inset-0 rounded-xl bg-card shadow-soft" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
            <Icon className={cn("relative size-4", active && "text-primary")} />
            <span className="relative">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
