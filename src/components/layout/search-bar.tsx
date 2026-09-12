"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowUpRight, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { suggestAction } from "@/features/catalog/actions";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

type Suggestions = Awaited<ReturnType<typeof suggestAction>>["data"];

export function SearchBar({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Suggestions>(undefined);
  const [pending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  const active = q.trim().length >= 2;

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      startTransition(async () => {
        const res = await suggestAction({ q });
        setData(res.data);
      });
    }, 220);
    return () => clearTimeout(t);
  }, [q, active]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const showPanel = open && q.trim().length >= 2;

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <form onSubmit={submit} role="search" className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search for products, brands and more"
          aria-label="Search"
          className="h-11 w-full rounded-full border border-border bg-muted/60 pl-11 pr-11 text-sm outline-none transition-all placeholder:text-muted-foreground/80 focus:border-primary/40 focus:bg-card focus:shadow-glow"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {pending ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : q ? (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="rounded-full p-1 hover:bg-muted">
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </form>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-popover p-2 shadow-lift"
          >
            <SuggestionList data={data} q={q} onPick={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuggestionList({ data, q, onPick }: { data: Suggestions; q: string; onPick: () => void }) {
  if (!data) return <p className="px-3 py-3 text-sm text-muted-foreground">Searching…</p>;
  const empty = !data.products.length && !data.categories.length;

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      {data.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2 pb-2 pt-1">
          {data.categories.map((c) => (
            <Link
              key={c.slug}
              href={`/c/${c.slug}`}
              onClick={onPick}
              className="rounded-full bg-mint px-3 py-1 text-xs font-medium text-foreground hover:bg-mint/70"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
      {data.products.map((p) => (
        <Link
          key={p.slug}
          href={`/p/${p.slug}`}
          onClick={onPick}
          className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted"
        >
          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
            {p.image && <Image src={p.image} alt="" fill sizes="44px" className="object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{p.title}</p>
            <p className="text-xs text-muted-foreground">{p.brand}</p>
          </div>
          <span className="text-sm font-semibold">{formatPrice(p.price)}</span>
        </Link>
      ))}
      {empty && <p className="px-3 py-3 text-sm text-muted-foreground">No quick matches. Press Enter to search everything.</p>}
      <Link
        href={`/search?q=${encodeURIComponent(q)}`}
        onClick={onPick}
        className="mt-1 flex items-center justify-between rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/15"
      >
        Search for “{q}”
        <ArrowUpRight className="size-4" />
      </Link>
    </div>
  );
}
