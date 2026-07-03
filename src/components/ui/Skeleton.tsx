import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

/** Feed-card shaped skeleton used while videos load. */
export function VideoCardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <Skeleton className="aspect-[9/16] w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function FeedItemSkeleton() {
  return (
    <div className="mx-auto flex aspect-[9/16] w-full max-w-[420px] items-center justify-center">
      <Skeleton className="h-full w-full rounded-3xl" />
    </div>
  );
}
