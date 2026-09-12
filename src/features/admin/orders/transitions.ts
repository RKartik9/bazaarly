import type { OrderStatus } from "@/lib/db/enums";

export const ADMIN_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["return_requested"],
  return_requested: ["returned", "delivered"],
  returned: [],
  cancelled: [],
};

export const TRANSITION_LABEL: Record<OrderStatus, string> = {
  pending: "Mark pending",
  confirmed: "Confirm order",
  packed: "Mark as packed",
  shipped: "Mark as shipped",
  delivered: "Mark as delivered",
  cancelled: "Cancel order",
  return_requested: "Open a return",
  returned: "Complete return & refund",
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return ADMIN_TRANSITIONS[from].includes(to);
}
