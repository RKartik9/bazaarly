import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { CategoryTree } from "@/features/admin/categories/components/category-tree";
import { listAdminCategories } from "@/features/admin/categories/queries";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const roots = await listAdminCategories();
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Categories" description="Two-level taxonomy that powers navigation and filtering." />
      <CategoryTree roots={roots} />
    </div>
  );
}
