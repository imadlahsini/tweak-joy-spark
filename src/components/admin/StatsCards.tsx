import { Skeleton } from "@/components/ui/skeleton";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
import { type StatCardDef, type ReservationStats } from "@/lib/admin-constants";

/* ------------------------------------------------------------------ */
/*  StatBentoCard — single stat for use inside a BentoCell            */
/* ------------------------------------------------------------------ */

interface StatBentoCardProps {
  card: StatCardDef;
  stats: ReservationStats;
  isLoading: boolean;
}

export const StatBentoCard = ({ card, stats, isLoading }: StatBentoCardProps) => {
  const Icon = card.icon;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-xl bg-primary/8" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3 w-20 rounded bg-foreground/10" />
            <Skeleton className="h-2.5 w-28 rounded bg-foreground/8" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 rounded bg-foreground/10" />
        <Skeleton className="h-3 w-32 rounded bg-foreground/8" />
      </div>
    );
  }

  const value = card.getValue(stats);
  const context = card.getContext?.(stats);
  const ratio =
    card.key === "total" || stats.total <= 0 ? null : Math.round((value / Math.max(stats.total, 1)) * 100);

  return (
    <div className="reservations-kpi-card relative">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${card.colorClasses.glow}`}
      />

      <div className="relative flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${card.colorClasses.plate}`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>

        <div className="min-w-0">
          <p className="reservations-kpi-label">{card.label}</p>
          <p className="reservations-kpi-context">{context ?? "Operational snapshot"}</p>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="reservations-kpi-value">
          <AnimatedCounter value={value} duration={0.9} />
        </p>
        {ratio !== null && (
          <span className="reservations-kpi-ratio">
            {ratio}% of total
          </span>
        )}
      </div>

      {card.key === "total" && (
        <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/90">
          Live reservation count
        </p>
      )}
      {card.key !== "total" && (
        <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/90">
          Within current filter window
        </p>
      )}
    </div>
  );
};

export default StatBentoCard;
