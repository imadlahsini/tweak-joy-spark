import { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusDotClass, statusLabel } from "@/lib/admin-constants";
import type { ReservationRow } from "@/types/reservations";

interface RecentActivityFeedProps {
  reservations: ReservationRow[];
}

const formatAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { type: "spring", damping: 24, stiffness: 280 } },
};

const RecentActivityFeed = ({ reservations }: RecentActivityFeedProps) => {
  const recent = useMemo(
    () =>
      [...reservations]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [reservations],
  );

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Recent Activity
        </p>
      </div>

      {recent.length === 0 ? (
        <p className="text-xs text-muted-foreground">No recent activity</p>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-2.5">
          {recent.map((r) => (
            <motion.div key={r.id} variants={item} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  statusDotClass[r.status],
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{r.clientName}</p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {formatAgo(r.updatedAt)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{statusLabel[r.status]}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default RecentActivityFeed;
