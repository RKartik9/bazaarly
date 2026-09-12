"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { Banknote, CreditCard } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPagination } from "@/features/admin/components/admin-pagination";
import { AdminTable, EmptyRow } from "@/features/admin/components/admin-table";
import { SearchInput } from "@/features/admin/components/search-input";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { ORDER_STATUS_LABEL } from "@/features/orders/types";
import { ORDER_STATUSES } from "@/lib/db/enums";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { AdminOrderPage } from "../queries";
import { adminOrderParsers } from "../search-params";

const PAYMENT_TONE: Record<string, string> = {
  paid: "text-success",
  refunded: "text-muted-foreground",
  failed: "text-destructive",
  pending: "text-saffron-foreground",
  cod_pending: "text-foreground",
};

export function OrdersTable({ data, counts }: { data: AdminOrderPage; counts: Record<string, number> }) {
  const [isPending, startTransition] = useTransition();
  const [params, setParams] = useQueryStates(adminOrderParsers, { shallow: false, startTransition, clearOnDefault: true });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={params.q} onChange={(q) => setParams({ q, page: 1 })} placeholder="Order #, customer, phone…" />
        <Select value={params.status} onValueChange={(v) => setParams({ status: v as typeof params.status, page: 1 })}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses ({counts.all ?? 0})</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ORDER_STATUS_LABEL[s]} ({counts[s] ?? 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={params.payment} onValueChange={(v) => setParams({ payment: v as typeof params.payment, page: 1 })}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any payment</SelectItem>
            <SelectItem value="razorpay">Razorpay</SelectItem>
            <SelectItem value="cod">Cash on delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AdminTable className={cn(isPending && "opacity-60 transition")}>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-4 text-right">Placed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.length === 0 && <EmptyRow colSpan={7}>No orders match these filters.</EmptyRow>}
          {data.rows.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="pl-4">
                <Link href={`/admin/orders/${o.orderNumber}`} className="font-semibold tabular-nums hover:underline">
                  #{o.orderNumber}
                </Link>
              </TableCell>
              <TableCell>
                <p className="font-medium">{o.customer.name}</p>
                <p className="text-xs text-muted-foreground">{o.customer.email || o.city}</p>
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">{o.itemCount}</TableCell>
              <TableCell className="font-semibold tabular-nums">{formatPrice(o.total)}</TableCell>
              <TableCell>
                <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", PAYMENT_TONE[o.paymentStatus])}>
                  {o.paymentMethod === "cod" ? <Banknote className="size-3.5" /> : <CreditCard className="size-3.5" />}
                  {o.paymentMethod === "cod" ? "COD" : "Razorpay"} · {o.paymentStatus.replace("_", " ")}
                </span>
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={o.status} />
              </TableCell>
              <TableCell className="pr-4 text-right text-xs text-muted-foreground">
                {new Date(o.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AdminTable>

      <AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={(page) => setParams({ page })} />
    </div>
  );
}
