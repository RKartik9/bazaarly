import type { OrderStatus } from "@/lib/db/enums";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "../types";

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", ORDER_STATUS_TONE[status], className)}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
