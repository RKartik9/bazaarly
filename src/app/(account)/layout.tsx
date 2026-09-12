import { redirect } from "next/navigation";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountNav } from "@/features/account/components/account-nav";
import { getSessionUser } from "@/lib/auth/current-user";
import { initials } from "@/lib/utils";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?redirect_url=/account/orders");

  return (
    <StorefrontShell>
      <div className="container-x py-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-6">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarImage src={user.imageUrl} alt="" />
                <AvatarFallback className="bg-lavender font-bold">{initials(user.name || user.email)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-heading text-lg font-bold">{user.name || "Your account"}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <AccountNav />
          </aside>
          <section className="min-w-0">{children}</section>
        </div>
      </div>
    </StorefrontShell>
  );
}
