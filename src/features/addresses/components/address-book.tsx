"use client";

import { useState } from "react";
import { MapPinPlus, Pencil, Star, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteAddressAction, setDefaultAddressAction } from "../actions";
import type { AddressDto } from "../types";
import { AddressCard } from "./address-card";
import { AddressForm } from "./address-form";

export function AddressBook({ initial }: { initial: AddressDto[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [editing, setEditing] = useState<AddressDto | "new" | null>(null);
  const remove = useAction(deleteAddressAction);
  const setDefault = useAction(setDefaultAddressAction);

  const onSaved = (address: AddressDto) => {
    setAddresses((prev) => {
      const others = prev.filter((a) => a.id !== address.id).map((a) => (address.isDefault ? { ...a, isDefault: false } : a));
      return [address, ...others].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    });
    setEditing(null);
  };

  const onDelete = async (id: string) => {
    const result = await remove.executeAsync({ id });
    if (result?.serverError) return toast.error(result.serverError);
    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (next.length && !next.some((a) => a.isDefault)) next[0] = { ...next[0]!, isDefault: true };
      return next;
    });
    toast.success("Address removed");
  };

  const onDefault = async (id: string) => {
    const result = await setDefault.executeAsync({ id });
    if (result?.serverError) return toast.error(result.serverError);
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })).sort((a, b) => Number(b.isDefault) - Number(a.isDefault)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{addresses.length} of 10 saved</p>
        <Button className="rounded-full" onClick={() => setEditing("new")} disabled={addresses.length >= 10}>
          <MapPinPlus className="size-4" /> Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card/60 p-12 text-center">
          <p className="font-heading text-xl font-bold">No saved addresses</p>
          <p className="mt-1 text-sm text-muted-foreground">Add one to breeze through checkout next time.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <AddressCard
              key={a.id}
              address={a}
              actions={
                <>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditing(a)}>
                    <Pencil className="size-3" /> Edit
                  </Button>
                  {!a.isDefault && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onDefault(a.id)} disabled={setDefault.isPending}>
                      <Star className="size-3" /> Make default
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs text-destructive hover:text-destructive" onClick={() => onDelete(a.id)} disabled={remove.isPending}>
                    <Trash2 className="size-3" /> Remove
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">{editing === "new" ? "Add a new address" : "Edit address"}</DialogTitle>
          </DialogHeader>
          <AddressForm address={editing === "new" ? null : editing} onSaved={onSaved} onCancel={() => setEditing(null)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
