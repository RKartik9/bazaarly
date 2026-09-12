"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { OrderStatus } from "@/lib/db/enums";
import { ORDER_STATUS_LABEL } from "@/features/orders/types";
import { addOrderNoteAction, transitionOrderAction } from "../actions";
import { ADMIN_TRANSITIONS, TRANSITION_LABEL } from "../transitions";

type Props = { orderNumber: string; status: OrderStatus; paid: boolean };

const DESTRUCTIVE: OrderStatus[] = ["cancelled", "returned"];

export function OrderStatusPanel({ orderNumber, status, paid }: Props) {
  const router = useRouter();
  const [target, setTarget] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const transition = useAction(transitionOrderAction);
  const addNote = useAction(addOrderNoteAction);
  const next = ADMIN_TRANSITIONS[status];

  async function confirm() {
    if (!target) return;
    const res = await transition.executeAsync({ orderNumber, status: target, note });
    if (res?.serverError) return toast.error(res.serverError);
    toast.success(`Order marked ${ORDER_STATUS_LABEL[target].toLowerCase()}`);
    setTarget(null);
    setNote("");
    router.refresh();
  }

  async function saveNote() {
    const res = await addNote.executeAsync({ orderNumber, note });
    if (res?.serverError) return toast.error(res.serverError);
    if (res?.validationErrors) return toast.error("Write a slightly longer note.");
    toast.success("Note added");
    setNoteOpen(false);
    setNote("");
    router.refresh();
  }

  const refundHint = target && DESTRUCTIVE.includes(target) && paid ? " The customer will be refunded automatically." : "";

  return (
    <section className="rounded-3xl bg-card p-5 shadow-soft">
      <h2 className="font-heading text-lg font-bold">Update status</h2>
      <p className="mt-1 text-sm text-muted-foreground">Currently {ORDER_STATUS_LABEL[status].toLowerCase()}.</p>
      <div className="mt-4 flex flex-col gap-2">
        {next.length === 0 && <p className="text-sm text-muted-foreground">This order is closed.</p>}
        {next.map((s) => (
          <Button key={s} variant={DESTRUCTIVE.includes(s) ? "outline" : "default"} className={DESTRUCTIVE.includes(s) ? "text-destructive" : undefined} onClick={() => setTarget(s)}>
            {TRANSITION_LABEL[s]}
          </Button>
        ))}
        <Button variant="ghost" onClick={() => setNoteOpen(true)}>
          <MessageSquarePlus className="size-4" /> Add internal note
        </Button>
      </div>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{target && TRANSITION_LABEL[target]}</DialogTitle>
            <DialogDescription>
              Add an optional note for the timeline.{refundHint}
            </DialogDescription>
          </DialogHeader>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="e.g. Shipped via Delhivery, AWB 1234567890" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTarget(null)}>
              Cancel
            </Button>
            <Button variant={target && DESTRUCTIVE.includes(target) ? "destructive" : "default"} onClick={confirm} disabled={transition.isPending}>
              {transition.isPending && <Loader2 className="size-4 animate-spin" />}
              {target && TRANSITION_LABEL[target]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a note</DialogTitle>
            <DialogDescription>Visible to the customer on their order timeline.</DialogDescription>
          </DialogHeader>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNoteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveNote} disabled={addNote.isPending}>
              {addNote.isPending && <Loader2 className="size-4 animate-spin" />}
              Save note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
