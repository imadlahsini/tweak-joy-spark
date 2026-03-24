import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatQueueDate, getTodayStr } from "@/lib/queue-constants";

interface QueueDatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  isToday: boolean;
  showContextBanner?: boolean;
}

const shiftDate = (dateStr: string, days: number): string => {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const QueueDatePicker = ({
  selectedDate,
  onDateChange,
  isToday,
  showContextBanner = true,
}: QueueDatePickerProps) => {
  const today = getTodayStr();
  const isFuture = selectedDate > today;

  return (
    <div
      className={cn(
        "queue-date-picker min-w-0",
        showContextBanner ? "flex flex-col gap-1.5" : "inline-flex shrink-0",
      )}
    >
      <div
        className={cn(
          "queue-date-picker-control inline-flex h-[34px] shrink-0 items-center rounded-[10px] border border-white/10 bg-white/[0.04] p-[3px] align-middle",
          !showContextBanner && "w-[clamp(148px,18vw,182px)] max-w-full",
        )}
      >
        <button
          type="button"
          onClick={() => onDateChange(shiftDate(selectedDate, -1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-white/35 transition-colors hover:bg-white/[0.07] hover:text-white/70"
          title="Previous day"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <div
          className={cn(
            "queue-date-picker-label flex items-center justify-center gap-1.5 px-2",
            showContextBanner ? "min-w-[170px] md:min-w-[182px]" : "min-w-0 flex-1",
          )}
        >
          <CalendarDays className="h-3.5 w-3.5 text-white/35" />
          <AnimatePresence mode="wait">
            <motion.span
              key={selectedDate}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14 }}
              className="truncate text-[0.76rem] font-medium text-white/75"
            >
              {formatQueueDate(selectedDate)}
            </motion.span>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => onDateChange(shiftDate(selectedDate, 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-white/35 transition-colors hover:bg-white/[0.07] hover:text-white/70"
          title="Next day"
          aria-label="Next day"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <AnimatePresence>
        {showContextBanner && !isToday && (
          <motion.div
            key={isFuture ? "future" : "past"}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-[10px] border px-2.5 py-1 text-[11px] font-medium",
                isFuture
                  ? "border-[#6DB5FF]/35 bg-[#6DB5FF]/10 text-[#6DB5FF]"
                  : "border-[#FFB347]/35 bg-[#FFB347]/10 text-[#FFB347]",
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {isFuture
                ? "Scheduling future appointments"
                : "Viewing historical data — read only"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QueueDatePicker;
