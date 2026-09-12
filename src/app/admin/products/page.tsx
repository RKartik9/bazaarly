import Link from "next/link";
import { Plus } from "lucide-react";
import type { SearchParams } from "nuqs/server";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { BulkStockDialog } from "@/features/admin/products/components/bulk-stock-dialog";
import { ProductsTable } from "@/features/admin/products/components/products-table";
import { getCategoryOptions, getProductStatusCounts, listAdminProducts } from "@/features/admin/products/queries";
import { loadAdminProductParams } from "@/features/admin/products/search-params";

export const metadata = { title: "Products" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await loadAdminProductParams(searchParams);
  const [data, categories, counts] = await Promise.all([listAdminProducts(params), getCategoryOptions(), getProductStatusCounts()]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description="Manage the catalogue, pricing and inventory."
        action={
          <div className="flex gap-2">
            <BulkStockDialog />
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="size-4" /> New product
              </Link>
            </Button>
          </div>
        }
      />
      <ProductsTable data={data} categories={categories} counts={counts} />
    </div>
  );
}
