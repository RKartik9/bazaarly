import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import type { NavCategory } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

const tintClass: Record<string, string> = {
  blush: "bg-blush",
  mint: "bg-mint",
  sky: "bg-sky",
  lavender: "bg-lavender",
  butter: "bg-butter",
};

const spans = [
  "sm:col-span-2 sm:row-span-2",
  "",
  "",
  "sm:col-span-2",
  "",
  "",
  "sm:col-span-2",
  "",
];

export function CategoryMosaic({ categories }: { categories: NavCategory[] }) {
  return (
    <section className="container-x py-16">
      <SectionHeading eyebrow="Browse" title="Shop by category" description="Eight worlds, thousands of finds. Start where your day starts." />
      <Stagger className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[170px] sm:grid-cols-4">
        {categories.map((cat, i) => (
          <StaggerItem key={cat.slug} className={cn(spans[i % spans.length])}>
            <Link
              href={`/c/${cat.slug}`}
              className={cn(
                "group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl p-4 transition-shadow hover:shadow-lift",
                tintClass[cat.tint] ?? "bg-blush",
              )}
            >
              <div className="absolute inset-0">
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              <div className="relative flex items-start justify-between">
                <span className="rounded-full bg-card/80 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
                  {cat.children.length} collections
                </span>
                <span className="flex size-8 items-center justify-center rounded-full bg-card/80 text-foreground backdrop-blur transition-transform group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
              <div className="relative">
                <p className="font-heading text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-background sm:text-2xl">{cat.name}</p>
                <p className="mt-1 line-clamp-1 text-xs text-foreground/70 transition-colors group-hover:text-background/80">{cat.description}</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
