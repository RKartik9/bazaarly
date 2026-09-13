import { NotFoundScene } from "@/components/feedback/not-found-scene";
import { StorefrontShell } from "@/components/layout/storefront-shell";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <StorefrontShell>
      <NotFoundScene />
    </StorefrontShell>
  );
}
