import { Skeleton } from "@/components/ui/skeleton";

const SkeletonStatCard = () => (
  <div className="admin-glass-panel-soft rounded-2xl p-4 h-[96px]">
    <div className="flex items-start gap-3">
      <Skeleton className="h-10 w-10 rounded-xl bg-primary/10" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-7 w-16 rounded bg-foreground/10" />
        <Skeleton className="h-3 w-12 rounded bg-foreground/7" />
      </div>
    </div>
  </div>
);

const SkeletonTableRow = ({ delay }: { delay: number }) => (
  <div
    className="flex items-center gap-4 border-b border-border/55 px-4 py-4"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-28 rounded bg-foreground/10" />
      <Skeleton className="h-3 w-20 rounded bg-foreground/8" />
    </div>
    <div className="flex-1">
      <Skeleton className="h-4 w-36 rounded bg-foreground/10" />
    </div>
    <div className="flex-1">
      <Skeleton className="h-8 w-24 rounded-lg bg-foreground/10" />
    </div>
    <div className="flex-1">
      <Skeleton className="h-5 w-16 rounded-full bg-foreground/10" />
    </div>
    <div className="flex-shrink-0">
      <Skeleton className="h-3 w-16 rounded bg-foreground/8" />
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="admin-glass-panel-soft rounded-2xl p-4 space-y-3">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded bg-foreground/10" />
        <Skeleton className="h-3 w-24 rounded bg-foreground/8" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full bg-foreground/10" />
    </div>
    <Skeleton className="h-3 w-44 rounded bg-foreground/8" />
    <Skeleton className="h-9 w-full rounded-lg bg-foreground/10" />
  </div>
);

const ReservationsLoadingSkeleton = () => (
  <div className="space-y-4">
    {/* Stats cards skeleton */}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>

    {/* Table skeleton (desktop) */}
    <div className="admin-glass-panel-soft hidden overflow-hidden rounded-2xl md:block">
      <div className="flex items-center gap-4 border-b border-border/65 bg-white/55 px-4 py-3">
        {["w-24", "w-32", "w-20", "w-16", "w-28", "w-14"].map((w, i) => (
          <Skeleton key={i} className={`h-3 ${w} rounded bg-foreground/8`} />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonTableRow key={i} delay={i * 50} />
      ))}
    </div>

    {/* Card skeleton (mobile) */}
    <div className="space-y-3 md:hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

export default ReservationsLoadingSkeleton;
