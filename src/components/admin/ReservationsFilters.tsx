import { AnimatePresence, motion } from "framer-motion";
import { CalendarRange, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ReservationsFiltersProps {
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  variant?: "panel" | "topbar";
}

const formatDateInput = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeekStartMonday = (value: Date) => {
  const date = new Date(value);
  const offsetFromMonday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offsetFromMonday);
  return date;
};

const getWeekEndSunday = (value: Date) => {
  const start = getWeekStartMonday(value);
  start.setDate(start.getDate() + 6);
  return start;
};

const ReservationsFilters = ({
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  hasActiveFilters,
  onClearFilters,
  variant = "panel",
}: ReservationsFiltersProps) => {
  const isTopBar = variant === "topbar";

  const applyDateFrom = (nextDateFrom: string) => {
    if (!nextDateFrom) {
      onDateFromChange("");
      return;
    }

    onDateFromChange(nextDateFrom);
    if (dateTo && nextDateFrom > dateTo) {
      onDateToChange(nextDateFrom);
    }
  };

  const applyDateTo = (nextDateTo: string) => {
    if (!nextDateTo) {
      onDateToChange("");
      return;
    }

    onDateToChange(nextDateTo);
    if (dateFrom && nextDateTo < dateFrom) {
      onDateFromChange(nextDateTo);
    }
  };

  const setQuickDate = (preset: string) => {
    const today = new Date();
    const setDateRange = (startDate: Date, endDate: Date) => {
      onDateFromChange(formatDateInput(startDate));
      onDateToChange(formatDateInput(endDate));
    };

    switch (preset) {
      case "today":
        setDateRange(today, today);
        break;
      case "week": {
        const start = getWeekStartMonday(today);
        const end = getWeekEndSunday(today);
        setDateRange(start, end);
        break;
      }
      case "month": {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setDateRange(start, end);
        break;
      }
      case "last7": {
        const start = new Date(today);
        start.setDate(today.getDate() - 6);
        setDateRange(start, today);
        break;
      }
      case "last30": {
        const start = new Date(today);
        start.setDate(today.getDate() - 29);
        setDateRange(start, today);
        break;
      }
    }
  };

  return (
    <section className={cn("reservations-filter-card", isTopBar && "reservations-filter-topbar")}>
      <header
        className={cn(
          "reservations-filter-header mb-3 flex items-center justify-between gap-3",
          isTopBar && "mb-2",
        )}
      >
        <div>
          <p className="reservations-eyebrow">{isTopBar ? "Reservations" : "Date Window"}</p>
          <h2 className="reservations-filter-title">Filter Reservations</h2>
        </div>
        <span className="reservations-filter-state">
          {hasActiveFilters ? "Custom range" : "All dates"}
        </span>
      </header>

      <div
        className={cn(
          "reservations-filter-controls grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2",
          isTopBar && "lg:grid-cols-2 xl:grid-cols-2",
        )}
      >
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => applyDateFrom(e.target.value)}
          max={dateTo || undefined}
          className="admin-control h-10 rounded-xl"
          aria-label="Filter from date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => applyDateTo(e.target.value)}
          min={dateFrom || undefined}
          className="admin-control h-10 rounded-xl"
          aria-label="Filter to date"
        />
      </div>

      <div
        className={cn(
          "reservations-filter-actions mt-2 flex flex-wrap items-center gap-2",
          isTopBar && "mt-0",
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="admin-control h-10 gap-1.5 rounded-xl px-3 text-foreground hover:bg-white/72"
            >
              <CalendarRange className="h-4 w-4" />
              Quick Range
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="admin-glass-panel-soft border-border/70 text-foreground"
          >
            <DropdownMenuItem onClick={() => setQuickDate("today")}>Today</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setQuickDate("week")}>This Week</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setQuickDate("month")}>This Month</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setQuickDate("last7")}>Last 7 Days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setQuickDate("last30")}>Last 30 Days</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="admin-chip h-10 gap-1.5 rounded-xl border border-rose-300/50 bg-rose-50/85 px-3 text-rose-700 hover:border-rose-300/75 hover:bg-rose-100/90 hover:text-rose-800"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ReservationsFilters;
