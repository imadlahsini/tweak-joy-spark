import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarRange,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  reservationStatuses,
  statusDotClass,
  statusLabel,
} from "@/lib/admin-constants";
import type { ReservationStatus } from "@/types/reservations";

interface ReservationsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | ReservationStatus;
  onStatusFilterChange: (value: "all" | ReservationStatus) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const ReservationsFilters = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  hasActiveFilters,
  onClearFilters,
}: ReservationsFiltersProps) => {
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" keyboard shortcut to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const setQuickDate = (preset: string) => {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    switch (preset) {
      case "today":
        onDateFromChange(fmt(today));
        onDateToChange(fmt(today));
        break;
      case "week": {
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay() + 1);
        onDateFromChange(fmt(start));
        onDateToChange(fmt(today));
        break;
      }
      case "month": {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        onDateFromChange(fmt(start));
        onDateToChange(fmt(today));
        break;
      }
      case "last7": {
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        onDateFromChange(fmt(start));
        onDateToChange(fmt(today));
        break;
      }
      case "last30": {
        const start = new Date(today);
        start.setDate(today.getDate() - 30);
        onDateFromChange(fmt(start));
        onDateToChange(fmt(today));
        break;
      }
    }
  };

  const allStatuses: Array<"all" | ReservationStatus> = ["all", ...reservationStatuses];

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Search + Status pills */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name or phone"
            className="admin-control h-10 pl-9 pr-10 rounded-xl"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center rounded border border-border/65 bg-white/55 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline-flex">
            /
          </kbd>
        </div>

        {/* Status pill toggles */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {allStatuses.map((s) => {
            const isActive = statusFilter === s;
            const label = s === "all" ? "All" : statusLabel[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => onStatusFilterChange(s)}
                className={cn(
                  "admin-chip inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border transition-all duration-150",
                  isActive
                    ? "border-cyan-300/60 bg-cyan-400/15 text-cyan-700"
                    : "border-border/70 bg-white/55 text-muted-foreground hover:border-border/90 hover:bg-white/72 hover:text-foreground",
                )}
              >
                {s !== "all" && (
                  <span
                    className={cn("inline-block h-1 w-1 rounded-full shrink-0", statusDotClass[s])}
                  />
                )}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Date range + quick presets + clear (collapsible on mobile) */}
      <Collapsible defaultOpen className="sm:!block">
        <CollapsibleTrigger className="mb-2 flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground sm:hidden">
          <ChevronDown className="h-3.5 w-3.5 transition-transform [[data-state=open]_&]:rotate-180" />
          Date filters
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="admin-control h-10 rounded-xl sm:w-40"
              aria-label="Filter from date"
            />
            <span className="hidden text-xs text-muted-foreground sm:block">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="admin-control h-10 rounded-xl sm:w-40"
              aria-label="Filter to date"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="admin-control h-10 gap-1.5 rounded-xl px-3 text-foreground hover:bg-white/72"
                >
                  <CalendarRange className="h-4 w-4" />
                  Quick
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ReservationsFilters;
