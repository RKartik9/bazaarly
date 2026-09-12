import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="font-heading text-7xl font-extrabold text-blush">404</p>
      <h1 className="mt-2 font-heading text-2xl font-bold">Nothing here</h1>
      <p className="mt-2 text-sm text-muted-foreground">That record doesn&apos;t exist or was removed.</p>
      <Button asChild className="mt-6 rounded-full">
        <Link href="/admin">Back to dashboard</Link>
      </Button>
    </div>
  );
}
