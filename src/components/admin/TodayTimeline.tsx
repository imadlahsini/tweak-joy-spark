import { useMemo } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusDotClass, statusLabel, formatTimeOnly } from "@/lib/admin-constants";
import type { ReservationRow } from "@/types/reservations";

interface TodayTimelineProps {
  reservations: ReservationRow[];
}

const getTodayDateString = () => {
  // Use Africa/Casablanca timezone to match the rest of the admin
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Africa/Casablanca",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
};

const TodayTimeline = ({ reservations }: TodayTimelineProps) => {
  const todayStr = useMemo(getTodayDateString, []);

  const grouped = useMemo(() => {
    const today = reservations.filter((r) => r.appointmentDate === todayStr);
    const byHour = new Map<string, ReservationRow[]>();

    for (const r of today) {
      const hour = formatTimeOnly(r.appointmentAt).split(":")[0] + ":00";
      const existing = byHour.get(hour) ?? [];
      existing.push(r);
      byHour.set(hour, existing);
    }

    return Array.from(byHour.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [reservations, todayStr]);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Today's Timeline
        </p>
      </div>

      {grouped.length === 0 ? (
        <p className="text-xs text-muted-foreground">No appointments today</p>
      ) : (
        <div className="relative flex flex-col gap-3 pl-5">
          {/* Vertical line */}
          <div className="absolute left-[5px] top-1 bottom-1 w-px bg-gradient-to-b from-primary/40 via-accent/30 to-transparent" />

          {grouped.map(([hour, items]) => (
            <div key={hour} className="relative">
              {/* Hour dot */}
              <div className="absolute -left-5 top-0.5 h-[10px] w-[10px] rounded-full border-2 border-primary/50 bg-background" />

              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold text-foreground">{hour}</p>
                {items.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 pl-1">
                    <span
                      className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusDotClass[r.status])}
                    />
                    <span className="truncate text-xs text-foreground/80">{r.clientName}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {statusLabel[r.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayTimeline;
