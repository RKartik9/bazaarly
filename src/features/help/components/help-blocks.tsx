import { Check, X } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { CompareColumn, Faq, Stat, Step, TableRow } from "../content";

const TINT: Record<Stat["tint"], string> = {
  mint: "bg-mint text-teal",
  sky: "bg-sky text-foreground",
  lavender: "bg-lavender text-foreground",
  butter: "bg-butter text-foreground",
};

export function HelpSection({ id, title, children, className }: { id?: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("scroll-mt-28 space-y-4", className)}>
      <h2 className="font-heading text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

export function StatTiles({ stats }: { stats: Stat[] }) {
  return (
    <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-4" stagger={0.05}>
      {stats.map((s) => (
        <StaggerItem key={s.label} className={cn("rounded-2xl p-4", TINT[s.tint])}>
          <p className="font-heading text-2xl font-extrabold leading-none">{s.value}</p>
          <p className="mt-1.5 text-xs font-medium opacity-80">{s.label}</p>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.title} className="relative rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <s.icon className="size-4" />
            </span>
            <span className="text-xs font-bold text-muted-foreground">0{i + 1}</span>
          </div>
          <p className="mt-3 text-sm font-semibold">{s.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function CompareColumns({ columns }: { columns: CompareColumn[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {columns.map((c) => {
        const good = c.tone === "good";
        return (
          <div key={c.title} className={cn("rounded-2xl p-4", good ? "bg-success/10" : "bg-blush/60")}>
            <p className={cn("text-sm font-bold", good ? "text-success" : "text-primary")}>{c.title}</p>
            <ul className="mt-3 space-y-2">
              {c.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  {good ? <Check className="size-4 shrink-0 text-success" /> : <X className="size-4 shrink-0 text-primary" />}
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function InfoTable({ rows }: { rows: TableRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-sm not-last:border-b border-border/60 sm:grid-cols-[1.2fr_1fr_1.4fr]">
          <p className="font-semibold">{r.label}</p>
          <p className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums">{r.value}</p>
          {r.note && <p className="col-span-2 text-xs text-muted-foreground sm:col-span-1">{r.note}</p>}
        </div>
      ))}
    </div>
  );
}

export function FaqList({ items }: { items: Faq[] }) {
  return (
    <Accordion type="single" collapsible className="rounded-2xl border border-border/70 bg-card px-4 shadow-soft">
      {items.map((f) => (
        <AccordionItem key={f.q} value={f.q}>
          <AccordionTrigger className="py-3.5 text-left text-sm font-semibold">{f.q}</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
