"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPagination } from "@/features/admin/components/admin-pagination";
import { AdminTable, EmptyRow } from "@/features/admin/components/admin-table";
import { SearchInput } from "@/features/admin/components/search-input";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { AdminCustomerPage } from "../queries";
import { adminCustomerParsers } from "../search-params";

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");

export function CustomersTable({ data }: { data: AdminCustomerPage }) {
  const [isPending, startTransition] = useTransition();
  const [params, setParams] = useQueryStates(adminCustomerParsers, { shallow: false, startTransition, clearOnDefault: true });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={params.q} onChange={(q) => setParams({ q, page: 1 })} placeholder="Name, email or phone…" />
        <Select value={params.sort} onValueChange={(v) => setParams({ sort: v as typeof params.sort, page: 1 })}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Newest first</SelectItem>
            <SelectItem value="spend">Highest spend</SelectItem>
            <SelectItem value="orders">Most orders</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AdminTable className={cn(isPending && "opacity-60 transition")}>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Lifetime spend</TableHead>
            <TableHead>Last order</TableHead>
            <TableHead className="pr-4 text-right">Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.length === 0 && <EmptyRow colSpan={6}>No customers match your search.</EmptyRow>}
          {data.rows.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="pl-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarImage src={c.imageUrl || undefined} alt="" />
                    <AvatarFallback>{(c.name || c.email).slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{c.name || "—"}</p>
                      {c.role === "admin" && <Badge variant="secondary">Admin</Badge>}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{c.phone || "—"}</TableCell>
              <TableCell>
                {c.orders > 0 ? (
                  <Link href={`/admin/orders?q=${encodeURIComponent(c.email)}`} className="font-medium tabular-nums hover:underline">
                    {c.orders}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="font-semibold tabular-nums">{formatPrice(c.spend)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{fmt(c.lastOrderAt)}</TableCell>
              <TableCell className="pr-4 text-right text-xs text-muted-foreground">{fmt(c.joinedAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AdminTable>

      <AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={(page) => setParams({ page })} />
    </div>
  );
}
