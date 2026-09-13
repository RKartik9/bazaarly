import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, CreditCard, PackageSearch, RotateCcw } from "lucide-react";
import { getSessionUser } from "@/lib/auth/current-user";
import { ContactForm } from "@/features/help/components/contact-form";
import { HelpHeader } from "@/features/help/components/help-shell";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Message us about an order, return or payment. Replies within a business day.",
};

const QUICK = [
  { icon: PackageSearch, label: "Where's my order?", href: "/account/orders", tint: "bg-sky" },
  { icon: RotateCcw, label: "Return or exchange", href: "/help/returns", tint: "bg-mint" },
  { icon: CreditCard, label: "Payment or refund", href: "/help/returns#refunds", tint: "bg-lavender" },
];

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const [user, params] = await Promise.all([getSessionUser(), searchParams]);
  const email = user?.email ?? (typeof params.email === "string" ? params.email.slice(0, 120) : "");

  return (
    <div className="space-y-8">
      <HelpHeader
        title="Contact us"
        intro="Most things are one tap away. For everything else, write to us."
        action={
          <p className="inline-flex items-center gap-1.5 rounded-full bg-butter px-3 py-1.5 text-xs font-semibold">
            <Clock className="size-3.5" /> Replies within 24h · Mon–Sat
          </p>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {QUICK.map((q) => (
          <Link key={q.label} href={q.href} className={`group flex items-center justify-between rounded-2xl p-4 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${q.tint}`}>
            <span className="inline-flex items-center gap-2">
              <q.icon className="size-4" /> {q.label}
            </span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <ContactForm defaults={{ name: user?.name ?? "", email }} />
    </div>
  );
}
