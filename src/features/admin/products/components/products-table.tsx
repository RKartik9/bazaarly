"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPagination } from "@/features/admin/components/admin-pagination";
import { AdminTable, EmptyRow } from "@/features/admin/components/admin-table";
import { SearchInput } from "@/features/admin/components/search-input";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import { deleteProductAction, setProductStatusAction } from "../actions";
import type { AdminProductPage, CategoryOption } from "../queries";
import { adminProductParsers } from "../search-params";

type Props = { data: AdminProductPage; categories: CategoryOption[]; counts: Record<string, number> };

const STATUS_TONE: Record<string, string> = {
  active: "bg-success/15 text-success",
  draft: "bg-butter text-foreground",
  archived: "bg-muted text-muted-foreground",
};

export function ProductsTable({ data, categories, counts }: Props) {
  const [isPending, startTransition] = useTransition();
  const [params, setParams] = useQueryStates(adminProductParsers, { shallow: false, startTransition, clearOnDefault: true });
  const setStatus = useAction(setProductStatusAction);
  const remove = useAction(deleteProductAction);

  async function toggle(id: string, current: string) {
    const status = current === "active" ? "draft" : "active";
    const res = await setStatus.executeAsync({ id, status });
    if (res?.serverError) return toast.error(res.serverError);
    toast.success(status === "active" ? "Product published" : "Product unpublished");
  }

  async function destroy(id: string) {
    const res = await remove.executeAsync({ id });
    if (res?.serverError) return toast.error(res.serverError);
    toast.success(res?.data?.archived ? "Product has sales, so it was archived instead" : "Product deleted");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={params.q} onChange={(q) => setParams({ q, page: 1 })} placeholder="Search title, brand, tags…" />
        <Select value={params.category || "all"} onValueChange={(v) => setParams({ category: v === "all" ? "" : v, page: 1 })}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={params.stock} onValueChange={(v) => setParams({ stock: v as typeof params.stock, page: 1 })}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any stock</SelectItem>
            <SelectItem value="low">Low stock</SelectItem>
            <SelectItem value="out">Out of stock</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-1 rounded-xl bg-muted p-1">
          {(["all", "active", "draft", "archived"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setParams({ status: s, page: 1 })}
              className={cn("rounded-lg px-3 py-1 text-xs font-semibold capitalize transition", params.status === s ? "bg-card shadow-soft" : "text-muted-foreground hover:text-foreground")}
            >
              {s} <span className="tabular-nums opacity-60">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <AdminTable className={cn(isPending && "opacity-60 transition")}>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Sold</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.length === 0 && <EmptyRow colSpan={7}>No products match these filters.</EmptyRow>}
          {data.rows.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="pl-4">
                <div className="flex items-center gap-3">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">{p.image && <Image src={p.image} alt="" fill sizes="44px" className="object-cover" />}</div>
                  <div className="min-w-0">
                    <Link href={`/admin/products/${p.id}`} className="block truncate font-medium hover:underline">
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {p.brand} · {p.variantCount} SKU{p.variantCount === 1 ? "" : "s"}
                      {p.isFeatured && " · Featured"}
                      {p.isDeal && " · Deal"}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{p.categoryName}</TableCell>
              <TableCell className="tabular-nums">{formatPrice(p.basePrice)}</TableCell>
              <TableCell>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", p.totalStock === 0 ? "bg-destructive/10 text-destructive" : p.lowStock ? "bg-butter" : "bg-mint text-teal")}>{p.totalStock}</span>
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">{p.soldCount}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={cn("capitalize", STATUS_TONE[p.status])}>
                  {p.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Actions">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/products/${p.id}`}>
                        <Pencil className="size-4" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/p/${p.slug}`} target="_blank">
                        <Eye className="size-4" /> View on store
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggle(p.id, p.status)}>
                      {p.status === "active" ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      {p.status === "active" ? "Unpublish" : "Publish"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => destroy(p.id)}>
                      <Trash2 className="size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AdminTable>

      <AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={(page) => setParams({ page })} />
    </div>
  );
}
