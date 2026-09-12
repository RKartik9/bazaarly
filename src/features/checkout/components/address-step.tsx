"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddressCard } from "@/features/addresses/components/address-card";
import { AddressForm } from "@/features/addresses/components/address-form";
import type { AddressDto } from "@/features/addresses/types";
import { cn } from "@/lib/utils";
import { selectAddressAction } from "../actions";

type Props = { addresses: AddressDto[]; selectedId?: string };

export function AddressStep({ addresses: initial, selectedId }: Props) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initial);
  const [selected, setSelected] = useState(selectedId ?? initial.find((a) => a.isDefault)?.id ?? initial[0]?.id ?? null);
  const [editing, setEditing] = useState<AddressDto | null | "new">(initial.length ? null : "new");
  const [pending, start] = useTransition();

  const onSaved = (address: AddressDto) => {
    setAddresses((prev) => {
      const others = prev.filter((a) => a.id !== address.id).map((a) => (address.isDefault ? { ...a, isDefault: false } : a));
      return [address, ...others];
    });
    setSelected(address.id);
    setEditing(null);
  };

  const continueToDelivery = () => {
    if (!selected) return;
    start(async () => {
      const result = await selectAddressAction({ addressId: selected });
      if (result.serverError) {
        toast.error(result.serverError);
        return;
      }
      router.push("/checkout/delivery");
    });
  };

  return (
    <div className="space-y-5">
      {addresses.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} role="radio" aria-checked={selected === a.id} tabIndex={0} onClick={() => setSelected(a.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(a.id)} className="text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-2xl">
              <AddressCard
                address={a}
                selected={selected === a.id}
                compact
                className={cn("h-full cursor-pointer hover:border-primary/50")}
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(a);
                    }}
                  >
                    <Pencil className="size-3" /> Edit
                  </Button>
                }
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm font-medium text-muted-foreground transition hover:border-primary/50 hover:text-primary"
          >
            <Plus className="size-5" /> Add a new address
          </button>
        </div>
      )}

      {addresses.length > 0 && (
        <Button size="xl" className="rounded-xl" disabled={!selected || pending} onClick={continueToDelivery}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Deliver here <ArrowRight className="size-4" />
        </Button>
      )}

      {addresses.length === 0 && editing === "new" ? (
        <div className="rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="mb-4 font-heading text-lg font-bold">Add a delivery address</h2>
          <AddressForm onSaved={onSaved} />
        </div>
      ) : (
        <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">{editing === "new" ? "Add a new address" : "Edit address"}</DialogTitle>
            </DialogHeader>
            <AddressForm address={editing === "new" ? null : editing} onSaved={onSaved} onCancel={() => setEditing(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
