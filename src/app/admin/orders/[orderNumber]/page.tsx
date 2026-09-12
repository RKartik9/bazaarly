import { notFound } from "next/navigation";
import { AdminOrderDetailView } from "@/features/admin/orders/components/admin-order-detail";
import { getAdminOrder } from "@/features/admin/orders/queries";
import { orderNumberSchema } from "@/features/admin/orders/schemas";

export async function generateMetadata({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  return { title: `Order #${orderNumber}` };
}

export default async function AdminOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  if (!orderNumberSchema.safeParse(orderNumber).success) notFound();
  const order = await getAdminOrder(orderNumber);
  if (!order) notFound();
  return <AdminOrderDetailView order={order} />;
}
