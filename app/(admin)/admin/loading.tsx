import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-lg" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-96 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-lg" />
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    </div>
  );
}
