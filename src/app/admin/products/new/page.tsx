import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { ProductForm } from "@/features/admin/products/components/product-form";
import { getCategoryOptions } from "@/features/admin/products/queries";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await getCategoryOptions();
  return (
    <div className="space-y-6">
      <AdminPageHeader title="New product" description="Add a product with its variants, images and specs." />
      <ProductForm categories={categories} />
    </div>
  );
}
