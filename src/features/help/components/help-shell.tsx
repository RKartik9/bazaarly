import { Mail, Phone } from "lucide-react";
import { Crumbs } from "@/features/catalog/components/crumbs";
import { siteConfig } from "@/lib/site";
import { HELP_LINKS } from "../content";
import { HelpNav } from "./help-nav";

export function HelpShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x grid gap-10 py-6 sm:py-8 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <Crumbs items={[{ label: "Help" }]} />
        <HelpNav links={HELP_LINKS} />
        <div className="hidden rounded-3xl bg-butter/60 p-5 text-sm lg:block">
          <p className="font-heading font-bold">Talk to a human</p>
          <p className="mt-1 text-muted-foreground">Mon–Sat, 9 AM – 9 PM IST</p>
          <div className="mt-3 space-y-2">
            <a href={`mailto:${siteConfig.support.email}`} className="flex items-center gap-2 font-medium hover:text-primary">
              <Mail className="size-4 text-primary" /> {siteConfig.support.email}
            </a>
            <a href={`tel:${siteConfig.support.phone}`} className="flex items-center gap-2 font-medium hover:text-primary">
              <Phone className="size-4 text-primary" /> {siteConfig.support.phone}
            </a>
          </div>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function HelpHeader({ title, intro, action }: { title: string; intro: string; action?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">{title}</h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground sm:text-base">{intro}</p>
      </div>
      {action}
    </header>
  );
}
