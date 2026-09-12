"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductCardDto } from "@/features/catalog/types";
import { formatPrice } from "@/lib/money";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ spotlight }: { spotlight: ProductCardDto[] }) {
  const [main, second, third] = spotlight;

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-10 size-[34rem] rounded-full bg-blush blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -top-20 size-[30rem] rounded-full bg-butter blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 size-96 -translate-x-1/2 rounded-full bg-mint/70 blur-3xl" />

      <div className="container-x relative grid gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-20">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 px-3 py-1 text-xs font-semibold text-primary shadow-soft backdrop-blur"
          >
            <Sparkles className="size-3.5" /> Festive season drops are live
          </motion.p>

          <h1 className="mt-6 font-heading text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            {["Everything", "you love,", "delivered."].map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.1, ease }}
                  className={i === 2 ? "inline-block text-primary" : "inline-block"}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease }}
            className="mt-6 max-w-lg text-base text-muted-foreground sm:text-lg"
          >
            Phones, fashion, home and beauty from brands you trust — with free delivery over ₹999, 7-day returns and payments you can rely on.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button asChild size="xl" className="rounded-full shadow-glow">
              <Link href="/deals">
                Shop today&apos;s deals <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="rounded-full bg-card/70 backdrop-blur">
              <Link href="/c/electronics">Explore electronics</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="mt-10 flex flex-wrap items-center gap-6 text-sm"
          >
            <div className="flex items-center gap-1 text-saffron">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
              <span className="ml-1 font-semibold text-foreground">4.8</span>
              <span className="text-muted-foreground">from 12k+ reviews</span>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">2 lakh+</span> orders delivered
            </p>
          </motion.div>
        </div>

        <div className="relative grid grid-cols-6 grid-rows-6 gap-3 sm:h-[520px]">
          {main && (
            <HeroTile product={main} className="col-span-4 row-span-6" delay={0.2} priority />
          )}
          {second && <HeroTile product={second} className="col-span-2 row-span-3" delay={0.35} />}
          {third && <HeroTile product={third} className="col-span-2 row-span-3" delay={0.5} />}
        </div>
      </div>
    </section>
  );
}

function HeroTile({ product, className, delay, priority }: { product: ProductCardDto; className?: string; delay: number; priority?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.9, delay, ease }}
      whileHover={{ y: -6 }}
      className={className}
    >
      <Link href={`/p/${product.slug}`} className="group relative block h-full min-h-40 overflow-hidden rounded-3xl bg-muted shadow-lift">
        <Image
          src={product.image}
          alt={product.title}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 60vw, 30vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-background">
          <div className="min-w-0">
            <p className="truncate text-[11px] uppercase tracking-wider text-background/70">{product.brand}</p>
            <p className="truncate text-sm font-semibold">{product.title}</p>
          </div>
          <span className="shrink-0 rounded-full bg-background/90 px-2.5 py-1 text-xs font-bold text-foreground">{formatPrice(product.price)}</span>
        </div>
      </Link>
    </motion.div>
  );
}
