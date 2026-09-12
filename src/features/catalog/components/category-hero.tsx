import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { CategoryDto } from "../types";
import { Crumbs } from "./crumbs";

const tintClass: Record<string, string> = {
  blush: "bg-blush",
  mint: "bg-mint",
  sky: "bg-sky",
  lavender: "bg-lavender",
  butter: "bg-butter",
};

type Props = {
  category: CategoryDto;
  parent: CategoryDto | null;
  subcategories: CategoryDto[];
  total: number;
};

export function CategoryHero({ category, parent, subcategories, total }: Props) {
  return (
    <section className={cn("relative overflow-hidden rounded-3xl", tintClass[category.tint] ?? "bg-blush")}>
      {category.image && (
        <Image src={category.image} alt="" fill sizes="100vw" priority className="object-cover opacity-30 mix-blend-multiply" />
      )}
      <div className="relative grid gap-6 p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <Crumbs
            items={[
              ...(parent ? [{ label: parent.name, href: `/c/${parent.slug}` }] : []),
              { label: category.name },
            ]}
          />
          <Reveal>
            <h1 className="mt-3 font-heading text-4xl font-extrabold leading-none sm:text-5xl">{category.name}</h1>
          </Reveal>
          {category.description && (
            <Reveal delay={0.08}>
              <p className="mt-3 max-w-xl text-sm text-foreground/70 sm:text-base">{category.description}</p>
            </Reveal>
          )}
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-foreground/60">{total.toLocaleString("en-IN")} products</p>
        </div>

        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
            {subcategories.map((c) => (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className="rounded-full border border-ink/15 bg-background/70 px-3.5 py-1.5 text-sm font-medium backdrop-blur transition hover:bg-ink hover:text-background"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
