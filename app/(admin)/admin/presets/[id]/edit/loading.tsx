import { Skeleton } from '@/components/ui/skeleton';

export default function EditPresetLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-[680px] w-full" />
        <Skeleton className="hidden h-[420px] w-full xl:block" />
      </div>
    </div>
  );
}
