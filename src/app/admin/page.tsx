import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { LowStockList, Panel, RecentOrders, TopProducts } from "@/features/admin/dashboard/dashboard-lists";
import { KpiCards } from "@/features/admin/dashboard/kpi-cards";
import { getDashboardKpis, getLowStock, getRecentOrders, getRevenueSeries, getTopProducts } from "@/features/admin/dashboard/queries";
import { RevenueChart } from "@/features/admin/dashboard/revenue-chart";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [kpis, series, top, lowStock, recent] = await Promise.all([getDashboardKpis(), getRevenueSeries(30), getTopProducts(5), getLowStock(8), getRecentOrders(6)]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Dashboard" description="What's happening across the store in the last 30 days." />
      <KpiCards kpis={kpis} />

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Revenue" className="xl:col-span-2">
          <RevenueChart data={series} />
        </Panel>
        <Panel title="Top products">
          <TopProducts products={top} />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Recent orders"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/orders">
                All orders <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        >
          <RecentOrders orders={recent} />
        </Panel>
        <Panel
          title="Low stock"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/products?stock=low">
                Manage <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        >
          <LowStockList rows={lowStock} />
        </Panel>
      </div>
    </div>
  );
}
