"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { bulkStockAction } from "../actions";

function parseLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [sku, stock] = l.split(/[,\s]+/);
      return { sku: sku ?? "", stock: Number(stock) };
    });
}

export function BulkStockDialog() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { executeAsync, isPending } = useAction(bulkStockAction);

  async function submit() {
    const updates = parseLines(text);
    if (!updates.length) return toast.error("Paste at least one line.");
    if (updates.some((u) => !u.sku || Number.isNaN(u.stock))) return toast.error("Each line must be “SKU, stock”.");
    const res = await executeAsync({ updates });
    if (res?.serverError) return toast.error(res.serverError);
    if (res?.validationErrors) return toast.error("Some rows are invalid — check SKUs and numbers.");
    const unknown = res?.data?.unknown ?? [];
    toast.success(`Updated ${res?.data?.updated ?? 0} SKU${res?.data?.updated === 1 ? "" : "s"}${unknown.length ? `; not found: ${unknown.join(", ")}` : ""}`);
    setText("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Layers className="size-4" /> Bulk stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk stock update</DialogTitle>
          <DialogDescription>One SKU per line, followed by the new stock level. Commas or spaces both work.</DialogDescription>
        </DialogHeader>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder={"AUR-ANC-BLK, 40\nNIKE-AF1-42 12"} className="font-mono text-xs" />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? "Updating…" : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
