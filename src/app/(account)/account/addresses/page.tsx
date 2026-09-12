import type { Metadata } from "next";
import { AddressBook } from "@/features/addresses/components/address-book";
import { getUserAddresses } from "@/features/addresses/queries";
import { requireSessionUser } from "@/lib/auth/current-user";

export const metadata: Metadata = { title: "Saved addresses", robots: { index: false } };

export default async function AddressesPage() {
  const user = await requireSessionUser("/account/addresses");
  const addresses = await getUserAddresses(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">Saved addresses</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage where your orders get delivered.</p>
      </div>
      <AddressBook initial={addresses} />
    </div>
  );
}
