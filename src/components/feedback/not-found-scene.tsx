"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Dices, Home, PackageOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const CAPTIONS = [
  "this page ghosted you",
  "404: page not found. vibes: also not found.",
  "we looked everywhere. even the drafts folder.",
  "this link has left the group chat",
  "it's not you, it's the URL",
  "the page said brb in 2019 and never came back",
  "main character energy, zero content",
];

const SURPRISE = ["/deals", "/c/electronics", "/c/womens-fashion", "/c/mens-fashion", "/c/home-kitchen", "/c/beauty", "/c/sports-fitness"];

export function NotFoundScene() {
  const router = useRouter();
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % CAPTIONS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="container-x relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden py-16 text-center">
      <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-full bg-butter px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-foreground">
        certified 404 moment
      </motion.span>

      <motion.p
        aria-label="404"
        className="relative mt-4 font-heading text-[9rem] font-extrabold leading-none tracking-tighter sm:text-[13rem]"
        animate={{ rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="absolute inset-0 translate-x-2 translate-y-2 text-mint" aria-hidden>404</span>
        <span className="absolute inset-0 -translate-x-2 -translate-y-1 text-sky" aria-hidden>404</span>
        <span className="relative text-primary">404</span>
      </motion.p>

      <div className="mt-2 h-8">
        <AnimatePresence mode="wait">
          <motion.h1
            key={i}
            initial={{ y: 12, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -12, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.35 }}
            className="font-heading text-xl font-bold sm:text-2xl"
          >
            {CAPTIONS[i]}
          </motion.h1>
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ rotate: -4, y: 20, opacity: 0 }}
        animate={{ rotate: -3, y: 0, opacity: 1 }}
        whileHover={{ rotate: 0, scale: 1.02 }}
        className="mt-8 w-full max-w-xs rounded-3xl border border-border/70 bg-card p-4 text-left shadow-lift"
      >
        <div className="grid h-28 place-items-center rounded-2xl bg-lavender text-foreground/70">
          <PackageOpen className="size-12" strokeWidth={1.5} />
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">limited edition</p>
        <p className="font-heading font-bold">The Page You Wanted</p>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="rounded-full bg-blush px-2 py-0.5 text-xs font-semibold text-primary">sold out forever</span>
          <span className="text-muted-foreground">0 left</span>
        </div>
        <p className="mt-2 text-xs italic text-muted-foreground">&ldquo;it&apos;s giving nothing&rdquo; — 0 reviews</p>
      </motion.div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="rounded-full">
          <Link href="/">
            <Home className="size-4" /> take me home
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <Link href="/search">
            <Search className="size-4" /> search instead
          </Link>
        </Button>
        <Button size="lg" variant="secondary" className="rounded-full" onClick={() => router.push(SURPRISE[Math.floor(Math.random() * SURPRISE.length)])}>
          <Dices className="size-4" /> surprise me
        </Button>
      </div>
    </div>
  );
}
