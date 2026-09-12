"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LayoutDashboard, Package, Shapes, ShoppingCart, TicketPercent, Users } from "lucide-react";
import { motion } from "motion/react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Shapes },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col gap-6 bg-ink p-5 text-background">
      <Logo light />
      <nav className="flex flex-1 flex-col gap-1">
        {ADMIN_LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "text-ink" : "text-background/70 hover:bg-background/10 hover:text-background",
              )}
            >
              {active && <motion.span layoutId="admin-nav-pill" className="absolute inset-0 rounded-xl bg-saffron" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <Icon className="relative size-4" />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>
      <Link href="/" className="inline-flex items-center gap-1.5 rounded-xl border border-background/15 px-3 py-2 text-xs font-medium text-background/70 hover:bg-background/10">
        View storefront <ArrowUpRight className="size-3.5" />
      </Link>
    </aside>
  );
}
