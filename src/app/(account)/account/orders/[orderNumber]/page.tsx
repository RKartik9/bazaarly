import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { OrderDetail } from "@/features/orders/components/order-detail";
import { getUserOrder } from "@/features/orders/queries";
import { requireSessionUser } from "@/lib/auth/current-user";

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Order #${orderNumber}`, robots: { index: false } };
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;
  const user = await requireSessionUser(`/account/orders/${orderNumber}`);
  const order = await getUserOrder(user.id, orderNumber);
  if (!order) notFound();

  return (
    <div className="space-y-4">
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> All orders
      </Link>
      <OrderDetail order={order} />
    </div>
  );
}
