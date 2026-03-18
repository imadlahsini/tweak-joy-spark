import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
import { statCards, type ReservationStats } from "@/lib/admin-constants";

interface StatsCardsProps {
  stats: ReservationStats;
  isLoading: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
};

const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="admin-glass-panel-soft rounded-2xl p-4 h-[96px]">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-xl bg-primary/8" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-7 w-16 rounded bg-foreground/10" />
                <Skeleton className="h-3 w-12 rounded bg-foreground/8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
    >
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = card.getValue(stats);

        return (
          <motion.div
            key={card.key}
            variants={item}
            className="admin-glass-panel-soft rounded-2xl p-4 relative overflow-hidden group hover:border-primary/28 transition-colors duration-200"
          >
            {/* Background glow */}
            <div
              className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${card.colorClasses.glow} blur-2xl pointer-events-none`}
            />

            <div className="relative flex items-start gap-3">
              {/* Icon plate */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${card.colorClasses.plate}`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </div>

              <div className="min-w-0">
                <p className="text-3xl font-bold text-foreground tracking-tight leading-none">
                  <AnimatedCounter value={value} duration={1.2} />
                </p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mt-1">
                  {card.label}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default StatsCards;
