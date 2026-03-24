import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { QueueStats as QueueStatsType } from "@/lib/queue-constants";
import { cn } from "@/lib/utils";

interface QueueStatsProps {
  stats: QueueStatsType;
  criticalWaitingCount: number;
  isLoading?: boolean;
}

const CountNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    let startedAt = 0;

    const tick = (timestamp: number) => {
      if (!startedAt) startedAt = timestamp;
      const progress = Math.min((timestamp - startedAt) / 850, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span className="queue-stat-value">
      {displayValue}
      {suffix ? <span className="queue-stat-value-suffix">{suffix}</span> : null}
    </span>
  );
};

const QueueStats = ({ stats, criticalWaitingCount, isLoading }: QueueStatsProps) => {
  const tiles = [
    {
      key: "waiting",
      label: "Waiting",
      value: stats.waiting,
      suffix: "",
      tag:
        criticalWaitingCount > 0
          ? `${criticalWaitingCount} critical`
          : stats.waiting > 0
            ? "monitoring"
            : "all clear",
      tagTone: criticalWaitingCount > 0 ? "danger" : "muted",
      className: "queue-stat-tile--amber",
    },
    {
      key: "with-doctor",
      label: "With Doctor",
      value: stats.withDoctor,
      suffix: "",
      tag: stats.completed > 0 ? `${stats.completed} completed` : "live now",
      tagTone: stats.completed > 0 ? "muted" : "accent",
      className: "queue-stat-tile--violet",
    },
    {
      key: "avg-wait",
      label: "Avg Wait",
      value: stats.avgWaitMinutes,
      suffix: "m",
      tag: `${stats.completed} completed`,
      tagTone: stats.avgWaitMinutes >= 120 ? "warn" : "muted",
      className: "queue-stat-tile--orange",
    },
  ] as const;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: "easeOut" }}
      className="queue-stats-strip"
    >
      {tiles.map((tile, index) => (
        <motion.article
          key={tile.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut", delay: 0.06 + index * 0.06 }}
          className={cn("queue-stat-tile", tile.className)}
        >
          <div className="queue-stat-glow" aria-hidden="true" />
          <div className="queue-stat-inner">
            <div className="queue-stat-head">
              <span className="queue-stat-label">{tile.label}</span>
              <span
                className={cn(
                  "queue-stat-tag",
                  tile.tagTone === "danger" && "queue-stat-tag--danger",
                  tile.tagTone === "warn" && "queue-stat-tag--warn",
                  tile.tagTone === "accent" && "queue-stat-tag--accent",
                  tile.tagTone === "muted" && "queue-stat-tag--muted",
                )}
              >
                {tile.tagTone === "danger" ? (
                  <span className="queue-stat-tag-pulse" aria-hidden="true" />
                ) : null}
                {isLoading ? "Updating..." : tile.tag}
              </span>
            </div>

            {isLoading ? (
              <span className="queue-stat-value queue-stat-value--placeholder">—</span>
            ) : (
              <CountNumber value={tile.value} suffix={tile.suffix} />
            )}
          </div>
        </motion.article>
      ))}
    </motion.section>
  );
};

export default QueueStats;
