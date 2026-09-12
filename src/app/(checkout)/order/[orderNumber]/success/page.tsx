import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OrderSuccess } from "@/features/orders/components/order-success";
import { getUserOrder } from "@/features/orders/queries";
import { requireSessionUser } from "@/lib/auth/current-user";

export const metadata: Metadata = { title: "Order placed", robots: { index: false } };

export default async function OrderSuccessPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const user = await requireSessionUser(`/order/${orderNumber}/success`);
  const order = await getUserOrder(user.id, orderNumber);
  if (!order) notFound();
  if (order.status === "pending" || order.status === "cancelled") redirect(`/account/orders/${order.orderNumber}`);

  return (
    <div className="py-8">
      <OrderSuccess order={order} />
    </div>
  );
}
