import { Skeleton } from "@/components/ui/skeleton";

export default function FeedbackLoading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-56" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
