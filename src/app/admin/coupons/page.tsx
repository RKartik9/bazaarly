import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { CouponsTable } from "@/features/admin/coupons/components/coupons-table";
import { listAdminCoupons } from "@/features/admin/coupons/queries";

export const metadata = { title: "Coupons" };

export default async function AdminCouponsPage() {
  const coupons = await listAdminCoupons();
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Coupons" description="Promotions customers can apply at checkout." />
      <CouponsTable coupons={coupons} />
    </div>
  );
}
