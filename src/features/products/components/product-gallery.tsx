"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = { images: string[]; title: string; activeImage?: string };

export function ProductGallery({ images, title, activeImage }: Props) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const [seenActive, setSeenActive] = useState(activeImage);

  if (activeImage !== seenActive) {
    setSeenActive(activeImage);
    const i = activeImage ? images.indexOf(activeImage) : -1;
    if (i >= 0) setIndex(i);
  }

  const current = images[index] ?? images[0];

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      <div className="flex gap-2 overflow-x-auto no-scrollbar lg:flex-col lg:overflow-visible">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onMouseEnter={() => setIndex(i)}
            onClick={() => setIndex(i)}
            aria-label={`View image ${i + 1}`}
            aria-current={i === index}
            className={cn(
              "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-muted transition lg:size-20",
              i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
            )}
          >
            <Image src={src} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>

      <div
        className="relative aspect-[4/5] flex-1 overflow-hidden rounded-3xl bg-muted"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: zoom ? 1.6 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            className="absolute inset-0"
          >
            <Image src={current} alt={title} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-background tabular-nums">
          {index + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
