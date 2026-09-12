"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminTable, EmptyRow } from "@/features/admin/components/admin-table";
import { ConfirmButton } from "@/features/admin/components/confirm-button";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import { deleteCouponAction, toggleCouponAction } from "../actions";
import type { AdminCouponRow } from "../queries";
import { CouponDialog } from "./coupon-dialog";

const STATE_TONE: Record<AdminCouponRow["state"], string> = {
  active: "bg-success/15 text-success",
  scheduled: "bg-sky text-foreground",
  expired: "bg-muted text-muted-foreground",
  exhausted: "bg-butter text-foreground",
  paused: "bg-muted text-muted-foreground",
};

function describe(c: AdminCouponRow) {
  if (c.type === "free_shipping") return "Free shipping";
  if (c.type === "percent") return `${c.value}% off${c.maxDiscount ? ` (up to ${formatPrice(c.maxDiscount)})` : ""}`;
  return `${formatPrice(c.value)} off`;
}

const fmt = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");

export function CouponsTable({ coupons }: { coupons: AdminCouponRow[] }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<{ open: boolean; coupon: AdminCouponRow | null }>({ open: false, coupon: null });
  const toggle = useAction(toggleCouponAction);
  const remove = useAction(deleteCouponAction);

  async function onToggle(c: AdminCouponRow, isActive: boolean) {
    const res = await toggle.executeAsync({ id: c.id, isActive });
    if (res?.serverError) return toast.error(res.serverError);
    router.refresh();
  }

  async function onDelete(id: string) {
    const res = await remove.executeAsync({ id });
    if (res?.serverError) return toast.error(res.serverError);
    toast.success("Coupon deleted");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialog({ open: true, coupon: null })}>
          <Plus className="size-4" /> New coupon
        </Button>
      </div>
      <AdminTable>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Min. order</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Valid</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.length === 0 && <EmptyRow colSpan={8}>No coupons yet. Create one to start running promotions.</EmptyRow>}
          {coupons.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="pl-4">
                <p className="font-mono font-semibold">{c.code}</p>
                {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
              </TableCell>
              <TableCell>{describe(c)}</TableCell>
              <TableCell className="tabular-nums text-muted-foreground">{c.minOrder ? formatPrice(c.minOrder) : "—"}</TableCell>
              <TableCell className="tabular-nums">
                {c.usedCount}
                {c.usageLimit != null && <span className="text-muted-foreground"> / {c.usageLimit}</span>}
                <p className="text-xs text-muted-foreground">{c.perUserLimit}× per customer</p>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {fmt(c.startsAt)} → {fmt(c.expiresAt)}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={cn("capitalize", STATE_TONE[c.state])}>
                  {c.state}
                </Badge>
              </TableCell>
              <TableCell>
                <Switch checked={c.isActive} onCheckedChange={(v) => onToggle(c, v)} aria-label={`Toggle ${c.code}`} />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-0.5">
                  <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setDialog({ open: true, coupon: c })}>
                    <Pencil className="size-4" />
                  </Button>
                  <ConfirmButton variant="ghost" size="icon-sm" aria-label="Delete" title={`Delete ${c.code}?`} description="Customers will no longer be able to apply this code. Past orders keep their discount." confirmLabel="Delete" onConfirm={() => onDelete(c.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </ConfirmButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AdminTable>
      <CouponDialog open={dialog.open} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} coupon={dialog.coupon} />
    </div>
  );
}
