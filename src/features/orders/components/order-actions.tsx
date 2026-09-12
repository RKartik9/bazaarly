"use client";

import { useState } from "react";
import { Loader2, Undo2, XCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { OrderStatus } from "@/lib/db/enums";
import { cancelOrderAction, requestReturnAction } from "../actions";
import { CANCELLABLE, RETURNABLE } from "../types";

type Mode = "cancel" | "return";

const copy: Record<Mode, { title: string; description: string; cta: string; placeholder: string }> = {
  cancel: {
    title: "Cancel this order?",
    description: "Items will be returned to stock immediately. Prepaid amounts are refunded to the original method within 5–7 business days.",
    cta: "Cancel order",
    placeholder: "Why are you cancelling? (e.g. ordered by mistake)",
  },
  return: {
    title: "Request a return",
    description: "We'll arrange a free pickup within 2 business days. Refunds are processed once the item reaches our warehouse.",
    cta: "Request return",
    placeholder: "What went wrong? (e.g. wrong size, damaged)",
  },
};

export function OrderActions({ orderNumber, status }: { orderNumber: string; status: OrderStatus }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [reason, setReason] = useState("");

  const cancel = useAction(cancelOrderAction);
  const request = useAction(requestReturnAction);
  const pending = cancel.isPending || request.isPending;

  const canCancel = CANCELLABLE.includes(status);
  const canReturn = RETURNABLE.includes(status);
  if (!canCancel && !canReturn) return null;

  const submit = async () => {
    if (!mode) return;
    const action = mode === "cancel" ? cancel : request;
    const result = await action.executeAsync({ orderNumber, reason });
    if (result?.serverError) return toast.error(result.serverError);
    if (result?.validationErrors) return toast.error(result.validationErrors.fieldErrors?.reason?.[0] ?? "Please add a reason.");
    toast.success(mode === "cancel" ? "Order cancelled" : "Return requested");
    setMode(null);
    setReason("");
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canCancel && (
          <Button variant="outline" className="rounded-full" onClick={() => setMode("cancel")}>
            <XCircle className="size-4" /> Cancel order
          </Button>
        )}
        {canReturn && (
          <Button variant="outline" className="rounded-full" onClick={() => setMode("return")}>
            <Undo2 className="size-4" /> Return items
          </Button>
        )}
      </div>

      <Dialog open={mode !== null} onOpenChange={(open) => !open && setMode(null)}>
        <DialogContent>
          {mode && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">{copy[mode].title}</DialogTitle>
                <DialogDescription>{copy[mode].description}</DialogDescription>
              </DialogHeader>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={copy[mode].placeholder} rows={3} maxLength={300} />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setMode(null)}>
                  Keep order
                </Button>
                <Button variant={mode === "cancel" ? "destructive" : "default"} disabled={pending || reason.trim().length < 3} onClick={submit}>
                  {pending && <Loader2 className="size-4 animate-spin" />}
                  {copy[mode].cta}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
