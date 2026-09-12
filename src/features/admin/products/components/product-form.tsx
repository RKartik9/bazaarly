"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormSection } from "@/features/admin/components/form-field";
import { ImageUploader } from "@/features/admin/components/image-uploader";
import { KeyValueEditor } from "@/features/admin/components/key-value-editor";
import { TagInput } from "@/features/admin/components/tag-input";
import { PRODUCT_STATUSES } from "@/lib/db/enums";
import { createProductAction, updateProductAction } from "../actions";
import type { CategoryOption } from "../queries";
import { productInputSchema, type ProductFormValues, type ProductInput } from "../schemas";
import { VariantsBuilder } from "./variants-builder";

type Props = { productId?: string; initialValues?: ProductFormValues; categories: CategoryOption[] };

const DEFAULTS: ProductFormValues = {
  title: "",
  slug: "",
  brand: "",
  category: "",
  description: "",
  highlights: [],
  specs: [],
  images: [],
  variantAxes: [],
  variants: [{ sku: "", attributes: {}, price: 0, mrp: 0, stock: 0, image: "" }],
  tags: [],
  isFeatured: false,
  isDeal: false,
  dealEndsAt: "",
  status: "active",
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);

const toLocalInput = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function ProductForm({ productId, initialValues, categories }: Props) {
  const router = useRouter();
  const form = useForm<ProductFormValues, unknown, ProductInput>({
    resolver: zodResolver(productInputSchema),
    defaultValues: initialValues ?? DEFAULTS,
  });
  const create = useAction(createProductAction);
  const update = useAction(updateProductAction);
  const pending = create.isPending || update.isPending;
  const err = form.formState.errors;

  const submit = form.handleSubmit(
    async (values) => {
      const result = productId ? await update.executeAsync({ id: productId, data: values }) : await create.executeAsync(values);
      if (result?.serverError) return toast.error(result.serverError);
      if (result?.validationErrors) return toast.error("Please check the highlighted fields.");
      if (!result?.data) return;
      toast.success(productId ? "Product updated" : "Product created");
      if (!productId) router.push(`/admin/products/${result.data.id}`);
      router.refresh();
    },
    () => toast.error("Please fix the errors before saving."),
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <FormSection title="Basics">
            <FormField label="Title" htmlFor="title" error={err.title?.message}>
              <Input
                id="title"
                {...form.register("title", {
                  onChange: (e) => {
                    if (!productId && !form.formState.dirtyFields.slug) form.setValue("slug", slugify(e.target.value));
                  },
                })}
                aria-invalid={!!err.title}
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Slug" htmlFor="slug" error={err.slug?.message} hint="Used in the product URL">
                <Input id="slug" {...form.register("slug")} aria-invalid={!!err.slug} className="font-mono text-xs" />
              </FormField>
              <FormField label="Brand" htmlFor="brand" error={err.brand?.message}>
                <Input id="brand" {...form.register("brand")} aria-invalid={!!err.brand} />
              </FormField>
            </div>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormField label="Category" error={err.category?.message}>
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={!!err.category} className="w-full">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />
            <FormField label="Description" htmlFor="description" error={err.description?.message}>
              <Textarea id="description" rows={6} {...form.register("description")} />
            </FormField>
            <Controller
              control={form.control}
              name="highlights"
              render={({ field }) => (
                <FormField label="Highlights" error={err.highlights?.message} hint="Short bullet points shown on the product page">
                  <TagInput value={field.value ?? []} onChange={field.onChange} placeholder="Add a highlight and press Enter" max={12} />
                </FormField>
              )}
            />
          </FormSection>

          <FormSection title="Images" description="The first image is the primary one. Use the star to promote another.">
            <Controller control={form.control} name="images" render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
            {err.images?.message && <p className="text-xs text-destructive">{err.images.message}</p>}
          </FormSection>

          <FormSection title="Variants & inventory">
            <VariantsBuilder />
          </FormSection>

          <FormSection title="Specifications">
            <Controller control={form.control} name="specs" render={({ field }) => <KeyValueEditor value={field.value ?? []} onChange={field.onChange} keyPlaceholder="e.g. Material" valuePlaceholder="e.g. 100% cotton" />} />
            {err.specs && <p className="text-xs text-destructive">Every spec needs a label and a value.</p>}
          </FormSection>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <FormSection title="Visibility">
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormField label="Status">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />
            <Controller
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <label className="flex items-center justify-between gap-3 text-sm font-medium">
                  Featured on home
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
            <Controller
              control={form.control}
              name="isDeal"
              render={({ field }) => (
                <label className="flex items-center justify-between gap-3 text-sm font-medium">
                  Part of deals
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
            <Controller
              control={form.control}
              name="dealEndsAt"
              render={({ field }) => (
                <FormField label="Deal ends" htmlFor="dealEndsAt" error={err.dealEndsAt?.message}>
                  <Input
                    id="dealEndsAt"
                    type="datetime-local"
                    value={toLocalInput(field.value ?? "")}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : "")}
                  />
                </FormField>
              )}
            />
          </FormSection>

          <FormSection title="Tags">
            <Controller control={form.control} name="tags" render={({ field }) => <TagInput value={field.value ?? []} onChange={field.onChange} placeholder="e.g. new, bestseller" />} />
          </FormSection>

          <div className="flex gap-2">
            <Button type="submit" size="lg" className="flex-1" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {productId ? "Save changes" : "Create product"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>
          </div>
        </aside>
      </form>
    </FormProvider>
  );
}
