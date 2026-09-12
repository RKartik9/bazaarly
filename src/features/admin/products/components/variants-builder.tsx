"use client";

import { Copy, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/features/admin/components/tag-input";
import { FormField } from "@/features/admin/components/form-field";
import type { ProductFormValues } from "../schemas";

const emptyVariant = (attributes: Record<string, string> = {}): ProductFormValues["variants"][number] => ({
  sku: "",
  attributes,
  price: 0,
  mrp: 0,
  stock: 0,
  image: "",
});

function skuFrom(brand: string, title: string, attributes: Record<string, string>, index: number) {
  const clean = (s: string) => s.replace(/[^a-z0-9]/gi, "").toUpperCase();
  const parts = [clean(brand).slice(0, 3) || "BZ", clean(title).slice(0, 4), ...Object.values(attributes).map((v) => clean(v).slice(0, 3))];
  return `${parts.filter(Boolean).join("-")}-${String(index + 1).padStart(2, "0")}`;
}

export function VariantsBuilder() {
  const { control, register, setValue, getValues, formState } = useFormContext<ProductFormValues>();
  const { fields, append, remove, insert } = useFieldArray({ control, name: "variants" });
  const axes = useWatch({ control, name: "variantAxes" }) ?? [];
  const variantErrors = formState.errors.variants;

  function autofillSkus() {
    const { brand, title, variants } = getValues();
    variants.forEach((v, i) => {
      if (!v.sku) setValue(`variants.${i}.sku`, skuFrom(brand, title, v.attributes ?? {}, i), { shouldDirty: true });
    });
  }

  return (
    <div className="space-y-4">
      <Controller
        control={control}
        name="variantAxes"
        render={({ field }) => (
          <FormField label="Variant axes" hint="e.g. color, size, storage. Leave empty for a single-SKU product.">
            <TagInput value={field.value ?? []} onChange={field.onChange} placeholder="Add an axis and press Enter" max={3} />
          </FormField>
        )}
      />

      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {axes.map((axis) => (
                <th key={axis} className="px-3 py-2 font-semibold capitalize">
                  {axis}
                </th>
              ))}
              <th className="px-3 py-2 font-semibold">SKU</th>
              <th className="px-3 py-2 font-semibold">Price</th>
              <th className="px-3 py-2 font-semibold">MRP</th>
              <th className="px-3 py-2 font-semibold">Stock</th>
              <th className="px-3 py-2 font-semibold">Image URL</th>
              <th className="w-20 px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {fields.map((row, i) => {
              const rowErr = variantErrors?.[i];
              return (
                <tr key={row.id} className="align-top">
                  {axes.map((axis) => (
                    <td key={axis} className="px-2 py-2">
                      <Input {...register(`variants.${i}.attributes.${axis}` as const)} placeholder={axis} className="h-8 min-w-24" />
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <Input {...register(`variants.${i}.sku`)} placeholder="SKU" className="h-8 min-w-32 font-mono text-xs uppercase" aria-invalid={!!rowErr?.sku} />
                    {rowErr?.sku && <p className="mt-1 text-[11px] text-destructive">{rowErr.sku.message}</p>}
                  </td>
                  <td className="px-2 py-2">
                    <Input type="number" min={0} step="1" {...register(`variants.${i}.price`)} className="h-8 w-24" aria-invalid={!!rowErr?.price} />
                  </td>
                  <td className="px-2 py-2">
                    <Input type="number" min={0} step="1" {...register(`variants.${i}.mrp`)} className="h-8 w-24" aria-invalid={!!rowErr?.mrp} />
                    {rowErr?.mrp && <p className="mt-1 text-[11px] text-destructive">{rowErr.mrp.message}</p>}
                  </td>
                  <td className="px-2 py-2">
                    <Input type="number" min={0} step="1" {...register(`variants.${i}.stock`)} className="h-8 w-20" aria-invalid={!!rowErr?.stock} />
                  </td>
                  <td className="px-2 py-2">
                    <Input {...register(`variants.${i}.image`)} placeholder="Optional https://…" className="h-8 min-w-40 text-xs" aria-invalid={!!rowErr?.image} />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex gap-0.5">
                      <Button type="button" variant="ghost" size="icon-sm" aria-label="Duplicate row" onClick={() => insert(i + 1, { ...getValues(`variants.${i}`), sku: "" })}>
                        <Copy className="size-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove row" disabled={fields.length === 1} onClick={() => remove(i)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {typeof variantErrors?.message === "string" && <p className="text-xs text-destructive">{variantErrors.message}</p>}
      {typeof variantErrors?.root?.message === "string" && <p className="text-xs text-destructive">{variantErrors.root.message}</p>}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => append(emptyVariant(Object.fromEntries(axes.map((a) => [a, ""]))))}>
          <Plus className="size-3.5" /> Add variant
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={autofillSkus}>
          Auto-fill empty SKUs
        </Button>
      </div>
    </div>
  );
}
