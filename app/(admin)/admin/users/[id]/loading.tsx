import { Skeleton } from "@/components/ui/skeleton";

export default function UserDetailLoading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
