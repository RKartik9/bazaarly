"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Link2, Loader2, Star, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUploadSignatureAction } from "@/features/admin/products/actions";
import { isAllowedImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

type Props = { value: string[]; onChange: (next: string[]) => void; folder?: "products" | "categories"; max?: number };

const MAX_BYTES = 5 * 1024 * 1024;

export function ImageUploader({ value, onChange, folder = "products", max = 8 }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(0);
  const sign = useAction(getUploadSignatureAction);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    const accepted = Array.from(files).slice(0, max - value.length);
    if (!accepted.length) return toast.error(`You can add up to ${max} images.`);

    const signed = await sign.executeAsync({ folder });
    if (!signed?.data) return toast.error(signed?.serverError ?? "Upload is not available right now.");
    const { cloudName, apiKey, timestamp, signature, folder: cldFolder } = signed.data;

    setUploading(accepted.length);
    const uploaded: string[] = [];
    for (const file of accepted) {
      if (!file.type.startsWith("image/") || file.size > MAX_BYTES) {
        toast.error(`${file.name}: images only, up to 5 MB.`);
        continue;
      }
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", apiKey);
      body.append("timestamp", String(timestamp));
      body.append("signature", signature);
      body.append("folder", cldFolder);
      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
        const json = (await res.json()) as { secure_url?: string; error?: { message: string } };
        if (!json.secure_url) throw new Error(json.error?.message ?? "Upload failed");
        uploaded.push(json.secure_url);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (uploaded.length) onChange([...value, ...uploaded]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function addUrl() {
    const v = url.trim();
    if (!isAllowedImageUrl(v)) return toast.error("Use an https URL from Cloudinary or Unsplash.");
    if (value.includes(v)) return setUrl("");
    if (value.length >= max) return toast.error(`You can add up to ${max} images.`);
    onChange([...value, v]);
    setUrl("");
  }

  const move = (from: number, to: number) => {
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {value.map((src, i) => (
          <div key={src} className={cn("group relative aspect-square overflow-hidden rounded-2xl border bg-muted", i === 0 && "ring-2 ring-primary ring-offset-2")}>
            <Image src={src} alt="" fill sizes="160px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-ink/70 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
              {i > 0 ? (
                <button type="button" onClick={() => move(i, 0)} className="rounded-md bg-background/90 p-1 text-xs" aria-label="Make primary">
                  <Star className="size-3.5" />
                </button>
              ) : (
                <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">Primary</span>
              )}
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="rounded-md bg-background/90 p-1" aria-label="Remove image">
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`up-${i}`} className="grid aspect-square place-items-center rounded-2xl border border-dashed bg-muted/40">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ))}
        {value.length + uploading < max && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <span className="flex flex-col items-center gap-1 text-xs font-medium">
              <ImagePlus className="size-5" />
              Upload
            </span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => uploadFiles(e.target.files)} />
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="…or paste an https:// image URL"
            className="pl-9"
          />
        </div>
        <Button type="button" variant="outline" onClick={addUrl}>
          Add
        </Button>
      </div>
    </div>
  );
}
