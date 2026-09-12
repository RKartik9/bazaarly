import type { SearchParams } from "nuqs/server";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { CustomersTable } from "@/features/admin/customers/components/customers-table";
import { listAdminCustomers } from "@/features/admin/customers/queries";
import { loadAdminCustomerParams } from "@/features/admin/customers/search-params";

export const metadata = { title: "Customers" };

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await loadAdminCustomerParams(searchParams);
  const data = await listAdminCustomers(params);
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Customers" description="Everyone who has signed in, with their order history." />
      <CustomersTable data={data} />
    </div>
  );
}
