import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2 font-heading text-2xl font-bold tracking-tight", className)}
      aria-label={`${siteConfig.name} home`}
    >
      <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-glow">
        <span className="absolute -right-2 -top-2 size-5 rounded-full bg-saffron/80 transition-transform duration-500 group-hover:translate-x-[-6px] group-hover:translate-y-[6px]" />
        <span className="relative text-lg font-black">b</span>
      </span>
      <span className={cn(light ? "text-background" : "text-foreground")}>
        {siteConfig.name.toLowerCase()}
        <span className="text-primary">.</span>
      </span>
    </Link>
  );
}
