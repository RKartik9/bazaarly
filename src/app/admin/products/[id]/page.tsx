import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { ProductForm } from "@/features/admin/products/components/product-form";
import { getAdminProduct, getCategoryOptions } from "@/features/admin/products/queries";
import { objectId } from "@/lib/validation";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!objectId.safeParse(id).success) notFound();

  const [product, categories] = await Promise.all([getAdminProduct(id), getCategoryOptions()]);
  if (!product) notFound();

  const reserved = product.reserved.reduce((s, r) => s + r.reserved, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={product.values.title}
        description={reserved ? `${reserved} unit${reserved === 1 ? "" : "s"} currently reserved in open checkouts.` : "Edit details, variants and inventory."}
        action={
          <Button asChild variant="outline">
            <Link href={`/p/${product.values.slug}`} target="_blank">
              View on store <ExternalLink className="size-4" />
            </Link>
          </Button>
        }
      />
      <ProductForm productId={product.id} initialValues={product.values} categories={categories} />
    </div>
  );
}
