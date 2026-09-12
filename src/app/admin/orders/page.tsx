import type { SearchParams } from "nuqs/server";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { OrdersTable } from "@/features/admin/orders/components/orders-table";
import { getOrderStatusCounts, listAdminOrders } from "@/features/admin/orders/queries";
import { loadAdminOrderParams } from "@/features/admin/orders/search-params";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await loadAdminOrderParams(searchParams);
  const [data, counts] = await Promise.all([listAdminOrders(params), getOrderStatusCounts()]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Orders" description="Track fulfilment, payments and returns." />
      <OrdersTable data={data} counts={counts} />
    </div>
  );
}
