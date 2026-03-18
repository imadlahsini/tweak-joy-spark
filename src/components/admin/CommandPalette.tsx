import { useEffect } from "react";
import { RefreshCcw, Trash2, CalendarDays } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { statusDotClass, statusLabel } from "@/lib/admin-constants";
import type { ReservationRow } from "@/types/reservations";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservations: ReservationRow[];
  onSelectReservation: (reservation: ReservationRow) => void;
  onRefresh: () => void;
  onClearFilters: () => void;
  onShowToday: () => void;
}

const CommandPalette = ({
  open,
  onOpenChange,
  reservations,
  onSelectReservation,
  onRefresh,
  onClearFilters,
  onShowToday,
}: CommandPaletteProps) => {
  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="admin-glass-panel overflow-hidden rounded-2xl">
        <CommandInput
          placeholder="Search reservations, actions..."
          className="h-12 border-b border-border/70 bg-transparent text-base text-foreground placeholder:text-muted-foreground"
        />
        <CommandList className="max-h-[360px] bg-transparent text-foreground">
          <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
            No results found.
          </CommandEmpty>

          {reservations.length > 0 && (
            <CommandGroup heading="Reservations" className="text-muted-foreground">
              {reservations.slice(0, 8).map((r) => (
                <CommandItem
                  key={r.id}
                  value={`${r.clientName} ${r.clientPhone}`}
                  onSelect={() => {
                    onSelectReservation(r);
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground data-[selected=true]:bg-primary/10 data-[selected=true]:text-foreground"
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      statusDotClass[r.status],
                    )}
                  />
                  <span className="truncate text-sm text-foreground">{r.clientName}</span>
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    {statusLabel[r.status]}
                  </span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {r.clientPhone}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator className="bg-border/75" />

          <CommandGroup heading="Quick Actions" className="text-muted-foreground">
            <CommandItem
              onSelect={() => {
                onRefresh();
                onOpenChange(false);
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground data-[selected=true]:bg-primary/10 data-[selected=true]:text-foreground"
            >
              <RefreshCcw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Refresh data</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onClearFilters();
                onOpenChange(false);
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground data-[selected=true]:bg-primary/10 data-[selected=true]:text-foreground"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Clear filters</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onShowToday();
                onOpenChange(false);
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground data-[selected=true]:bg-primary/10 data-[selected=true]:text-foreground"
            >
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Show today's appointments</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </div>
    </CommandDialog>
  );
};

export default CommandPalette;
