import { PageHeaderSkeleton, TableSkeleton } from "@/components/feedback/skeletons";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton />
    </div>
  );
}
