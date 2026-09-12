import { getNavCategories } from "@/features/catalog/queries";
import { getSessionUser } from "@/lib/auth/current-user";
import { AnnouncementBar } from "./announcement-bar";
import { HeaderActions } from "./header-actions";
import { Logo } from "./logo";
import { MegaNav } from "./mega-nav";
import { MobileNav } from "./mobile-nav";
import { SearchBar } from "./search-bar";

export async function Header() {
  const [categories, user] = await Promise.all([getNavCategories(), getSessionUser()]);

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />
      <div className="border-b bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="container-x flex h-16 items-center gap-3 sm:gap-6">
          <MobileNav categories={categories} />
          <Logo />
          <SearchBar className="hidden flex-1 max-w-2xl md:block" />
          <div className="ml-auto">
            <HeaderActions isAdmin={user?.role === "admin"} />
          </div>
        </div>
        <div className="container-x pb-3 md:hidden">
          <SearchBar />
        </div>
        <MegaNav categories={categories} />
      </div>
    </header>
  );
}
