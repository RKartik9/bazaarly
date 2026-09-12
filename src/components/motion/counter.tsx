"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useMotionValue } from "motion/react";
import { formatPrice } from "@/lib/money";

type CounterFormat = "number" | "currency";

type CounterProps = {
  value: number;
  format?: CounterFormat;
  duration?: number;
  className?: string;
};

const FORMATTERS: Record<CounterFormat, (n: number) => string> = {
  number: (n) => Math.round(n).toLocaleString("en-IN"),
  currency: (n) => formatPrice(Math.round(n)),
};

export function Counter({ value, format = "number", duration = 1.2, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  useEffect(() => {
    if (!inView) return;
    const render = FORMATTERS[format];
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = render(latest);
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, format, motionValue]);

  return (
    <span ref={ref} className={className}>
      {FORMATTERS[format](0)}
    </span>
  );
}
