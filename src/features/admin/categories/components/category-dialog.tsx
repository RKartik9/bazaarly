"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/features/admin/components/form-field";
import { ImageUploader } from "@/features/admin/components/image-uploader";
import { cn } from "@/lib/utils";
import { createCategoryAction, updateCategoryAction } from "../actions";
import type { AdminCategoryRow } from "../queries";
import { CATEGORY_TINTS, categoryInputSchema, type CategoryFormValues, type CategoryInput } from "../schemas";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: AdminCategoryRow | null;
  parents: { id: string; name: string }[];
  defaultParent?: string;
};

const EMPTY: CategoryFormValues = { name: "", slug: "", description: "", image: "", tint: "blush", parent: "", order: 0, isActive: true };

const TINT_CLASS: Record<(typeof CATEGORY_TINTS)[number], string> = { blush: "bg-blush", mint: "bg-mint", sky: "bg-sky", lavender: "bg-lavender", butter: "bg-butter" };

const toValues = (c: AdminCategoryRow): CategoryFormValues => ({
  name: c.name,
  slug: c.slug,
  description: c.description,
  image: c.image,
  tint: c.tint,
  parent: c.parent,
  order: c.order,
  isActive: c.isActive,
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function CategoryDialog({ open, onOpenChange, category, parents, defaultParent = "" }: Props) {
  const router = useRouter();
  const form = useForm<CategoryFormValues, unknown, CategoryInput>({ resolver: zodResolver(categoryInputSchema), defaultValues: EMPTY });
  const create = useAction(createCategoryAction);
  const update = useAction(updateCategoryAction);
  const pending = create.isPending || update.isPending;
  const err = form.formState.errors;

  useEffect(() => {
    if (!open) return;
    form.reset(category ? toValues(category) : { ...EMPTY, parent: defaultParent });
  }, [open, category, defaultParent, form]);

  const submit = form.handleSubmit(async (values) => {
    const result = category ? await update.executeAsync({ id: category.id, data: values }) : await create.executeAsync(values);
    if (result?.serverError) return toast.error(result.serverError);
    if (result?.validationErrors) return toast.error("Please check the highlighted fields.");
    toast.success(category ? "Category updated" : "Category created");
    onOpenChange(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Name" htmlFor="cat-name" error={err.name?.message}>
              <Input
                id="cat-name"
                {...form.register("name", {
                  onChange: (e) => {
                    if (!category && !form.formState.dirtyFields.slug) form.setValue("slug", slugify(e.target.value));
                  },
                })}
                aria-invalid={!!err.name}
              />
            </FormField>
            <FormField label="Slug" htmlFor="cat-slug" error={err.slug?.message}>
              <Input id="cat-slug" {...form.register("slug")} aria-invalid={!!err.slug} className="font-mono text-xs" />
            </FormField>
          </div>
          <FormField label="Description" htmlFor="cat-desc" error={err.description?.message}>
            <Textarea id="cat-desc" rows={2} {...form.register("description")} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="parent"
              render={({ field }) => (
                <FormField label="Parent" error={err.parent?.message}>
                  <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)} disabled={!!category?.children.length}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Top level</SelectItem>
                      {parents
                        .filter((p) => p.id !== category?.id)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />
            <FormField label="Sort order" htmlFor="cat-order" error={err.order?.message}>
              <Input id="cat-order" type="number" min={0} {...form.register("order")} />
            </FormField>
          </div>
          <Controller
            control={form.control}
            name="tint"
            render={({ field }) => (
              <FormField label="Accent tint">
                <div className="flex gap-2">
                  {CATEGORY_TINTS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => field.onChange(t)}
                      aria-label={t}
                      aria-pressed={field.value === t}
                      className={cn("size-8 rounded-full border-2 transition", TINT_CLASS[t], field.value === t ? "border-foreground scale-110" : "border-transparent")}
                    />
                  ))}
                </div>
              </FormField>
            )}
          />
          <Controller
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormField label="Cover image" error={err.image?.message}>
                <ImageUploader value={field.value ? [field.value] : []} onChange={(imgs) => field.onChange(imgs[0] ?? "")} folder="categories" max={1} />
              </FormField>
            )}
          />
          <Controller
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <label className="flex items-center justify-between text-sm font-medium">
                Visible in storefront
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
              {category ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
