import { ProductGridSkeleton } from "@/components/feedback/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="container-x space-y-8 py-6 sm:py-8">
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden space-y-6 lg:block">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-48" />
          </div>
          <ProductGridSkeleton count={12} className="lg:grid-cols-3 xl:grid-cols-4" />
        </div>
      </div>
    </div>
  );
}
