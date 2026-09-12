import type { Metadata } from "next";
import { UserProfile } from "@clerk/nextjs";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">Profile &amp; security</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your name, email, password and connected accounts.</p>
      </div>
      <UserProfile
        routing="path"
        path="/account/profile"
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full max-w-none shadow-soft rounded-3xl border border-border/60",
          },
        }}
      />
    </div>
  );
}
