import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { CartProvider } from "@/features/cart/cart-provider";
import { getCart } from "@/features/cart/queries";
import { getSessionUser } from "@/lib/auth/current-user";

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?redirect_url=/checkout");
  const cart = await getCart();

  return (
    <CartProvider initialCart={cart}>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/70 backdrop-blur">
          <div className="container-x flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ChevronLeft className="size-4" /> Bag
              </Link>
              <Logo />
            </div>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Lock className="size-3.5 text-success" /> Secure checkout
            </p>
          </div>
        </header>
        <main className="container-x py-8">{children}</main>
      </div>
    </CartProvider>
  );
}
