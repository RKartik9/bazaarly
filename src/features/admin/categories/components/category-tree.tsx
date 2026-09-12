"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CornerDownRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/features/admin/components/confirm-button";
import { cn } from "@/lib/utils";
import { deleteCategoryAction } from "../actions";
import type { AdminCategoryRow } from "../queries";
import { CategoryDialog } from "./category-dialog";

type DialogState = { open: boolean; category: AdminCategoryRow | null; parent: string };

export function CategoryTree({ roots }: { roots: AdminCategoryRow[] }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState>({ open: false, category: null, parent: "" });
  const remove = useAction(deleteCategoryAction);
  const parents = roots.map((r) => ({ id: r.id, name: r.name }));

  async function destroy(id: string) {
    const res = await remove.executeAsync({ id });
    if (res?.serverError) return toast.error(res.serverError);
    toast.success("Category deleted");
    router.refresh();
  }

  const row = (c: AdminCategoryRow, depth: number) => (
    <li key={c.id} className={cn("flex items-center gap-3 px-4 py-3", depth && "bg-muted/30")}>
      {depth > 0 && <CornerDownRight className="ml-2 size-4 text-muted-foreground" />}
      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">{c.image && <Image src={c.image} alt="" fill sizes="40px" className="object-cover" />}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{c.name}</p>
          {!c.isActive && <Badge variant="outline">Hidden</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          /c/{c.slug} · {c.productCount} product{c.productCount === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex items-center gap-0.5">
        {depth === 0 && (
          <Button variant="ghost" size="icon-sm" aria-label="Add sub-category" onClick={() => setDialog({ open: true, category: null, parent: c.id })}>
            <Plus className="size-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setDialog({ open: true, category: c, parent: "" })}>
          <Pencil className="size-4" />
        </Button>
        <ConfirmButton
          variant="ghost"
          size="icon-sm"
          aria-label="Delete"
          title={`Delete “${c.name}”?`}
          description="Only empty categories can be deleted. Products and sub-categories must be moved first."
          confirmLabel="Delete"
          onConfirm={() => destroy(c.id)}
        >
          <Trash2 className="size-4 text-destructive" />
        </ConfirmButton>
      </div>
    </li>
  );

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setDialog({ open: true, category: null, parent: "" })}>
          <Plus className="size-4" /> New category
        </Button>
      </div>
      <ul className="divide-y overflow-hidden rounded-3xl bg-card shadow-soft">
        {roots.length === 0 && <li className="px-4 py-14 text-center text-sm text-muted-foreground">No categories yet.</li>}
        {roots.flatMap((r) => [row(r, 0), ...r.children.map((c) => row(c, 1))])}
      </ul>
      <CategoryDialog open={dialog.open} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} category={dialog.category} parents={parents} defaultParent={dialog.parent} />
    </>
  );
}
