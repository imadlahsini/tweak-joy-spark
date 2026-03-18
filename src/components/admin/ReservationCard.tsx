import { motion } from "framer-motion";
import { CalendarClock, Check, ChevronDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ReservationStatusBadge from "@/components/admin/ReservationStatusBadge";
import {
  deliveryBadgeClass,
  deliveryLabel,
  formatDateTime,
  reminderBadgeClass,
  reminderTypeLabel,
  reservationStatuses,
  statusDotClass,
  statusLabel,
} from "@/lib/admin-constants";
import type { ReservationRow, ReservationStatus, ReminderStatus } from "@/types/reservations";

interface ReservationCardProps {
  reservation: ReservationRow;
  draftStatus: ReservationStatus;
  isSaving: boolean;
  onDraftStatusChange: (status: ReservationStatus) => void;
  onStatusSave: () => void;
  onCardClick: () => void;
  index: number;
}

const stripeClass: Record<ReservationStatus, string> = {
  new: "from-cyan-400/70 via-cyan-400 to-cyan-400/50",
  confirmed: "from-emerald-400/70 via-emerald-400 to-emerald-400/50",
  completed: "from-teal-400/70 via-teal-400 to-teal-400/50",
  cancelled: "from-rose-400/70 via-rose-400 to-rose-400/50",
  no_show: "from-amber-400/70 via-amber-400 to-amber-400/50",
};

const ReminderChip = ({
  label,
  status,
  attempts,
}: {
  label: string;
  status: ReminderStatus;
  attempts: number;
}) => (
  <div className={cn("admin-chip border", reminderBadgeClass[status])}>
    <span className="font-semibold">{label}</span> {status}
    {attempts > 0 ? ` · ${attempts}x` : ""}
  </div>
);

const ReservationCard = ({
  reservation,
  draftStatus,
  isSaving,
  onDraftStatusChange,
  onStatusSave,
  onCardClick,
  index,
}: ReservationCardProps) => {
  const statusChanged = draftStatus !== reservation.status;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", damping: 25, stiffness: 300 }}
      onClick={onCardClick}
      className="admin-glass-panel-soft relative cursor-pointer overflow-hidden rounded-2xl transition-colors hover:border-primary/25"
    >
      {/* Top stripe */}
      <div className={cn("h-[3px] bg-gradient-to-r", stripeClass[reservation.status])} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-foreground">
              {reservation.clientName}
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{reservation.clientPhone}</p>
          </div>
          <ReservationStatusBadge status={reservation.status} />
        </div>

        {/* Appointment time */}
        <div className="mt-3 flex items-center gap-2 text-sm text-foreground">
          <CalendarClock className="h-4 w-4 shrink-0 text-muted-foreground" />
          <p>{formatDateTime(reservation.appointmentAt)}</p>
        </div>

        {/* Status action */}
        <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Select
            value={draftStatus}
            onValueChange={(value) => onDraftStatusChange(value as ReservationStatus)}
          >
            <SelectTrigger className="admin-control h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reservationStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  <span className="flex items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 rounded-full", statusDotClass[s])} />
                    {statusLabel[s]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            onClick={onStatusSave}
            disabled={!statusChanged || isSaving}
            className="h-9 shrink-0 rounded-lg bg-cyan-500/90 px-3 text-white hover:bg-cyan-500 disabled:opacity-35"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Collapsible details */}
        <Collapsible>
          <CollapsibleTrigger
            className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <ChevronDown className="h-3.5 w-3.5 transition-transform [[data-state=open]_&]:rotate-180" />
            Details
          </CollapsibleTrigger>
          <CollapsibleContent onClick={(e) => e.stopPropagation()}>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Confirmation
                </p>
                <Badge
                  className={cn(
                    "admin-chip border mt-2",
                    deliveryBadgeClass[reservation.confirmation.status],
                  )}
                >
                  {deliveryLabel[reservation.confirmation.status]}
                </Badge>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Reminders</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <ReminderChip
                    label={reminderTypeLabel.r24h}
                    status={reservation.reminders.r24h.status}
                    attempts={reservation.reminders.r24h.attempts}
                  />
                  <ReminderChip
                    label={reminderTypeLabel.r3h}
                    status={reservation.reminders.r3h.status}
                    attempts={reservation.reminders.r3h.attempts}
                  />
                  <ReminderChip
                    label={reminderTypeLabel.r30m}
                    status={reservation.reminders.r30m.status}
                    attempts={reservation.reminders.r30m.attempts}
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </motion.article>
  );
};

export default ReservationCard;
