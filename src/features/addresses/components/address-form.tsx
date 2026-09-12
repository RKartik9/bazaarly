"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createAddressAction, updateAddressAction } from "../actions";
import { addressInputSchema, INDIAN_STATES, type AddressFormValues, type AddressInput } from "../schemas";
import type { AddressDto } from "../types";

type Props = {
  address?: AddressDto | null;
  onSaved: (address: AddressDto) => void;
  onCancel?: () => void;
  className?: string;
};

const TYPES = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "other", label: "Other" },
] as const;

export function AddressForm({ address, onSaved, onCancel, className }: Props) {
  const form = useForm<AddressFormValues, unknown, AddressInput>({
    resolver: zodResolver(addressInputSchema),
    defaultValues: {
      fullName: address?.fullName ?? "",
      phone: address?.phone ?? "",
      line1: address?.line1 ?? "",
      line2: address?.line2 ?? "",
      landmark: address?.landmark ?? "",
      city: address?.city ?? "",
      state: (address?.state as AddressFormValues["state"]) ?? undefined,
      pincode: address?.pincode ?? "",
      type: address?.type ?? "home",
      isDefault: address?.isDefault ?? false,
    },
  });

  const create = useAction(createAddressAction);
  const update = useAction(updateAddressAction);
  const pending = create.isPending || update.isPending;

  const submit = form.handleSubmit(async (values) => {
    const result = address ? await update.executeAsync({ ...values, id: address.id }) : await create.executeAsync(values);
    if (result?.serverError) return toast.error(result.serverError);
    if (result?.validationErrors) return toast.error("Please check the highlighted fields.");
    if (result?.data) {
      toast.success(address ? "Address updated" : "Address saved");
      onSaved(result.data);
    }
  });

  const err = form.formState.errors;
  const field = (name: keyof AddressFormValues, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`addr-${name}`}>{label}</Label>
      <Input id={`addr-${name}`} aria-invalid={!!err[name]} {...props} {...form.register(name)} />
      {err[name] && <p className="text-xs text-destructive">{err[name]?.message as string}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className={cn("space-y-4", className)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("fullName", "Full name", { autoComplete: "name" })}
        {field("phone", "Mobile number", { inputMode: "tel", autoComplete: "tel", placeholder: "10-digit number" })}
      </div>
      {field("line1", "Flat, house no., building", { autoComplete: "address-line1" })}
      {field("line2", "Area, street, sector (optional)", { autoComplete: "address-line2" })}
      <div className="grid gap-4 sm:grid-cols-3">
        {field("pincode", "Pincode", { inputMode: "numeric", maxLength: 6, autoComplete: "postal-code" })}
        {field("city", "City", { autoComplete: "address-level2" })}
        <div className="space-y-1.5">
          <Label>State</Label>
          <Controller
            control={form.control}
            name="state"
            render={({ field: f }) => (
              <Select value={f.value} onValueChange={f.onChange}>
                <SelectTrigger aria-invalid={!!err.state} className="w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {err.state && <p className="text-xs text-destructive">{err.state.message}</p>}
        </div>
      </div>
      {field("landmark", "Landmark (optional)", { placeholder: "Near the park, opposite the metro..." })}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Controller
          control={form.control}
          name="type"
          render={({ field: f }) => (
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => f.onChange(t.value)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                    f.value === t.value ? "border-ink bg-ink text-background" : "hover:border-ink/40",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        />
        <Controller
          control={form.control}
          name="isDefault"
          render={({ field: f }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={f.value} onCheckedChange={(v) => f.onChange(v === true)} />
              Make this my default address
            </label>
          )}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending} className="rounded-full px-6">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {address ? "Save changes" : "Save address"}
        </Button>
      </div>
    </form>
  );
}
