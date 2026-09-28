import { Skeleton } from '@/components/ui/skeleton';

export default function CategoriesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[420px] w-full" />
    </div>
  );
}
