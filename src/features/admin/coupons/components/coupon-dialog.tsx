"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/features/admin/components/form-field";
import { createCouponAction, updateCouponAction } from "../actions";
import type { AdminCouponRow } from "../queries";
import { couponInputSchema, type CouponFormValues, type CouponInput } from "../schemas";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; coupon?: AdminCouponRow | null };

const EMPTY: CouponFormValues = {
  code: "",
  description: "",
  type: "percent",
  value: 10,
  minOrder: 0,
  maxDiscount: "",
  usageLimit: "",
  perUserLimit: 1,
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

const TYPE_LABEL = { percent: "Percentage off", flat: "Flat amount off", free_shipping: "Free shipping" } as const;

const toLocal = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function CouponDialog({ open, onOpenChange, coupon }: Props) {
  const router = useRouter();
  const form = useForm<CouponFormValues, unknown, CouponInput>({ resolver: zodResolver(couponInputSchema), defaultValues: EMPTY });
  const create = useAction(createCouponAction);
  const update = useAction(updateCouponAction);
  const pending = create.isPending || update.isPending;
  const err = form.formState.errors;
  const type = useWatch({ control: form.control, name: "type" });

  useEffect(() => {
    if (!open) return;
    form.reset(
      coupon
        ? {
            code: coupon.code,
            description: coupon.description,
            type: coupon.type,
            value: coupon.value,
            minOrder: coupon.minOrder,
            maxDiscount: coupon.maxDiscount ?? "",
            usageLimit: coupon.usageLimit ?? "",
            perUserLimit: coupon.perUserLimit,
            startsAt: coupon.startsAt,
            expiresAt: coupon.expiresAt,
            isActive: coupon.isActive,
          }
        : EMPTY,
    );
  }, [open, coupon, form]);

  const submit = form.handleSubmit(async (values) => {
    const result = coupon ? await update.executeAsync({ id: coupon.id, data: values }) : await create.executeAsync(values);
    if (result?.serverError) return toast.error(result.serverError);
    if (result?.validationErrors) return toast.error("Please check the highlighted fields.");
    toast.success(coupon ? "Coupon updated" : "Coupon created");
    onOpenChange(false);
    router.refresh();
  });

  const dateField = (name: "startsAt" | "expiresAt", label: string) => (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormField label={label} htmlFor={`cp-${name}`} error={err[name]?.message}>
          <Input id={`cp-${name}`} type="datetime-local" value={toLocal(field.value ?? "")} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : "")} />
        </FormField>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{coupon ? `Edit ${coupon.code}` : "New coupon"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Code" htmlFor="cp-code" error={err.code?.message}>
              <Input id="cp-code" {...form.register("code")} className="font-mono uppercase" placeholder="WELCOME10" aria-invalid={!!err.code} />
            </FormField>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormField label="Type">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(TYPE_LABEL) as (keyof typeof TYPE_LABEL)[]).map((t) => (
                        <SelectItem key={t} value={t}>
                          {TYPE_LABEL[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />
          </div>
          <FormField label="Description" htmlFor="cp-desc" error={err.description?.message} hint="Shown to customers in the cart">
            <Input id="cp-desc" {...form.register("description")} placeholder="10% off your first order" />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-3">
            {type !== "free_shipping" && (
              <FormField label={type === "percent" ? "Percent off" : "Amount off (₹)"} htmlFor="cp-value" error={err.value?.message}>
                <Input id="cp-value" type="number" min={0} {...form.register("value")} aria-invalid={!!err.value} />
              </FormField>
            )}
            <FormField label="Min. order (₹)" htmlFor="cp-min" error={err.minOrder?.message}>
              <Input id="cp-min" type="number" min={0} {...form.register("minOrder")} />
            </FormField>
            {type === "percent" && (
              <FormField label="Max discount (₹)" htmlFor="cp-max" error={err.maxDiscount?.message}>
                <Input id="cp-max" type="number" min={0} {...form.register("maxDiscount")} placeholder="No cap" />
              </FormField>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Total uses" htmlFor="cp-limit" error={err.usageLimit?.message}>
              <Input id="cp-limit" type="number" min={0} {...form.register("usageLimit")} placeholder="Unlimited" />
            </FormField>
            <FormField label="Uses per customer" htmlFor="cp-per" error={err.perUserLimit?.message}>
              <Input id="cp-per" type="number" min={1} {...form.register("perUserLimit")} />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {dateField("startsAt", "Starts")}
            {dateField("expiresAt", "Expires")}
          </div>
          <Controller
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <label className="flex items-center justify-between text-sm font-medium">
                Active
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {coupon ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
