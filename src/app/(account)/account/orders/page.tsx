import type { Metadata } from "next";
import { OrderList } from "@/features/orders/components/order-list";
import { getUserOrders } from "@/features/orders/queries";
import { requireSessionUser } from "@/lib/auth/current-user";

export const metadata: Metadata = { title: "My orders", robots: { index: false } };

export default async function OrdersPage() {
  const user = await requireSessionUser("/account/orders");
  const orders = await getUserOrders(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">My orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track, cancel or return anything you&apos;ve bought.</p>
      </div>
      <OrderList orders={orders} />
    </div>
  );
}
