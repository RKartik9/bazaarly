import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CartProvider } from "@/features/cart/cart-provider";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { getCart } from "@/features/cart/queries";
import { getWishlistIds } from "@/features/wishlist/queries";
import { WishlistProvider } from "@/features/wishlist/wishlist-provider";
import { getSessionUser } from "@/lib/auth/current-user";

export async function StorefrontShell({ children }: { children: React.ReactNode }) {
  const [cart, wishlistIds, user] = await Promise.all([getCart(), getWishlistIds(), getSessionUser()]);

  return (
    <CartProvider initialCart={cart}>
      <WishlistProvider initialIds={wishlistIds} signedIn={!!user}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </WishlistProvider>
    </CartProvider>
  );
}
