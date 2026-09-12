import Link from "next/link";
import { Mail, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { Logo } from "./logo";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Electronics", href: "/c/electronics" },
      { label: "Men's Fashion", href: "/c/mens-fashion" },
      { label: "Women's Fashion", href: "/c/womens-fashion" },
      { label: "Home & Kitchen", href: "/c/home-kitchen" },
      { label: "Today's deals", href: "/deals" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My orders", href: "/account/orders" },
      { label: "Addresses", href: "/account/addresses" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Profile", href: "/account/profile" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track an order", href: "/account/orders" },
      { label: "Returns & refunds", href: "/help/returns" },
      { label: "Shipping policy", href: "/help/shipping" },
      { label: "Contact us", href: "/help/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-background">
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 size-[28rem] rounded-full bg-teal/40 blur-3xl" />

      <div className="container-x relative grid gap-12 py-16 lg:grid-cols-[1.4fr_2fr]">
        <div className="space-y-6">
          <Logo light />
          <p className="max-w-sm text-sm leading-relaxed text-background/70">{siteConfig.description}</p>
          <form className="flex max-w-md gap-2" action="/help/contact">
            <input
              type="email"
              name="email"
              required
              placeholder="Get deals in your inbox"
              className="h-11 flex-1 rounded-full border border-background/15 bg-background/10 px-4 text-sm text-background outline-none placeholder:text-background/50 focus:border-saffron"
            />
            <Button type="submit" size="lg" className="rounded-full">
              Subscribe <ArrowRight className="size-4" />
            </Button>
          </form>
          <div className="flex flex-wrap gap-4 text-sm text-background/70">
            <a href={`mailto:${siteConfig.support.email}`} className="inline-flex items-center gap-2 hover:text-background">
              <Mail className="size-4 text-saffron" /> {siteConfig.support.email}
            </a>
            <a href={`tel:${siteConfig.support.phone}`} className="inline-flex items-center gap-2 hover:text-background">
              <Phone className="size-4 text-saffron" /> {siteConfig.support.phone}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 font-heading text-sm font-semibold uppercase tracking-widest text-saffron">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm text-background/75 transition-colors hover:text-background">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative border-t border-background/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-background/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Made in India.</p>
          <p className="flex items-center gap-3">
            <span>UPI</span>
            <span>Cards</span>
            <span>Net banking</span>
            <span>Wallets</span>
            <span>Cash on delivery</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
