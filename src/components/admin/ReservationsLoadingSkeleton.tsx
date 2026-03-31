import { Skeleton } from "@/components/ui/skeleton";

const SkeletonTableRow = ({ delay }: { delay: number }) => (
  <div
    className="flex items-center gap-4 border-b border-white/[0.06] px-4 py-4"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-28 rounded bg-white/8" />
      <Skeleton className="h-3 w-16 rounded bg-white/5" />
    </div>
    <div className="flex-1">
      <Skeleton className="h-4 w-28 rounded bg-white/8" />
    </div>
    <div className="flex-1">
      <Skeleton className="h-4 w-24 rounded bg-white/8" />
    </div>
    <div className="flex-[1.2] flex items-center gap-2">
      <Skeleton className="h-8 w-full rounded-lg bg-white/8" />
      <Skeleton className="h-8 w-16 rounded-lg bg-white/8" />
    </div>
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-5 w-20 rounded-full bg-white/8" />
      <Skeleton className="h-3 w-28 rounded bg-white/5" />
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-3">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded bg-white/8" />
        <Skeleton className="h-3 w-24 rounded bg-white/5" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full bg-white/8" />
    </div>
    <Skeleton className="h-3 w-44 rounded bg-white/5" />
    <Skeleton className="h-9 w-full rounded-lg bg-white/8" />
  </div>
);

const ReservationsLoadingSkeleton = () => (
  <div className="space-y-4" aria-hidden="true">
    {/* Table skeleton (desktop) */}
    <div className="hidden overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] md:block">
      <div className="flex items-center gap-4 border-b border-white/[0.06] bg-white/[0.03] px-4 py-3">
        {["w-24", "w-28", "w-20", "w-36", "w-32"].map((w, i) => (
          <Skeleton key={i} className={`h-3 ${w} rounded bg-white/5`} />
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
