import type { DeliveryOption, OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/db/enums";
import type { AddressSnapshot } from "@/features/addresses/types";

export type OrderItemDto = {
  productId: string;
  slug: string;
  title: string;
  brand: string;
  image: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  mrp: number;
  qty: number;
};

export type OrderTimelineDto = { status: OrderStatus; note: string; at: string };

export type OrderDto = {
  id: string;
  orderNumber: string;
  items: OrderItemDto[];
  address: AddressSnapshot;
  pricing: { subtotal: number; discount: number; shipping: number; codFee: number; tax: number; total: number };
  couponCode: string | null;
  delivery: DeliveryOption;
  payment: { method: PaymentMethod; status: PaymentStatus; razorpayPaymentId: string | null; paidAt: string | null };
  status: OrderStatus;
  timeline: OrderTimelineDto[];
  cancelReason: string | null;
  returnReason: string | null;
  expectedDelivery: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderSummaryDto = Pick<OrderDto, "id" | "orderNumber" | "status" | "createdAt" | "expectedDelivery"> & {
  total: number;
  itemCount: number;
  preview: Pick<OrderItemDto, "title" | "image">[];
  paymentMethod: PaymentMethod;
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  return_requested: "Return requested",
  returned: "Returned",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-butter text-foreground",
  confirmed: "bg-sky text-foreground",
  packed: "bg-lavender text-foreground",
  shipped: "bg-mint text-teal",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  return_requested: "bg-butter text-foreground",
  returned: "bg-muted text-muted-foreground",
};

export const CANCELLABLE: OrderStatus[] = ["pending", "confirmed", "packed"];
export const RETURNABLE: OrderStatus[] = ["delivered"];
