"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { contactAction } from "../actions";
import { CONTACT_TOPIC_LABEL, CONTACT_TOPICS } from "../content";
import { contactSchema, type ContactFormValues, type ContactInput } from "../schemas";

type Props = { defaults?: Partial<Pick<ContactFormValues, "name" | "email">> };

export function ContactForm({ defaults }: Props) {
  const [ticketId, setTicketId] = useState<string | null>(null);
  const { executeAsync, isPending } = useAction(contactAction);
  const form = useForm<ContactFormValues, unknown, ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: defaults?.name ?? "", email: defaults?.email ?? "", topic: "order", orderNumber: "", message: "", website: "" },
  });

  const submit = form.handleSubmit(async (values) => {
    const result = await executeAsync(values);
    if (result?.serverError) return toast.error(result.serverError);
    if (result?.validationErrors) return toast.error("Please check the highlighted fields.");
    if (result?.data) setTicketId(result.data.ticketId);
  });

  if (ticketId) {
    return (
      <div className="rounded-3xl border border-success/30 bg-success/10 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <h2 className="mt-3 font-heading text-xl font-bold">Got it — we&apos;re on it</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ticket <span className="font-mono font-semibold text-foreground">#{ticketId}</span>. We usually reply within one business day.
        </p>
        <Button variant="outline" className="mt-5 rounded-full" onClick={() => setTicketId(null)}>
          Send another message
        </Button>
      </div>
    );
  }

  const err = form.formState.errors;
  const field = (name: "name" | "email" | "orderNumber", label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`contact-${name}`}>{label}</Label>
      <Input id={`contact-${name}`} aria-invalid={!!err[name]} {...props} {...form.register(name)} />
      {err[name] && <p className="text-xs text-destructive">{err[name]?.message}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-3xl border border-border/70 bg-card p-6 shadow-soft sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", "Your name", { autoComplete: "name" })}
        {field("email", "Email", { type: "email", autoComplete: "email" })}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-topic">What is it about?</Label>
          <Controller
            control={form.control}
            name="topic"
            render={({ field: f }) => (
              <Select value={f.value} onValueChange={f.onChange}>
                <SelectTrigger id="contact-topic" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_TOPICS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {CONTACT_TOPIC_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {field("orderNumber", "Order number (optional)", { placeholder: "BZ…", className: "uppercase" })}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" rows={6} aria-invalid={!!err.message} placeholder="What happened, and how can we help?" {...form.register("message")} />
        {err.message && <p className="text-xs text-destructive">{err.message.message}</p>}
      </div>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...form.register("website")} />
      <Button type="submit" size="lg" className="rounded-full" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Send message
      </Button>
    </form>
  );
}
