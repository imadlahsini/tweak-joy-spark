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
import {
  deliveryBadgeClass,
  deliveryLabel,
  formatDateTime,
  reminderBadgeClass,
  reminderTypeLabel,
  reservationStatuses,
  statusBadgeClass,
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
}: {
  label: string;
  status: ReminderStatus;
}) => (
  <div className="reservations-card-reminder-row">
    <span className="reservations-card-reminder-label">{label}</span>
    <span className={cn("reservations-card-reminder-status", reminderBadgeClass[status])}>
      {status}
    </span>
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
  const saveLabel = isSaving ? "Saving" : statusChanged ? "Save" : "Saved";
  const reminderStatuses = [
    reservation.reminders.r24h.status,
    reservation.reminders.r3h.status,
    reservation.reminders.r30m.status,
  ];
  const reminderCounts = reminderStatuses.reduce(
    (acc, status) => {
      acc[status] += 1;
      return acc;
    },
    {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    } as Record<ReminderStatus, number>,
  );
  const reminderSummaryLabel =
    reminderCounts.failed > 0
      ? `${reminderCounts.failed} failed`
      : reminderCounts.processing > 0
        ? `${reminderCounts.processing} processing`
        : reminderCounts.sent === reminderStatuses.length
          ? "All sent"
          : reminderCounts.pending === reminderStatuses.length
            ? "All pending"
            : `${reminderCounts.sent}/${reminderStatuses.length} sent`;
  const reminderSummaryClass =
    reminderCounts.failed > 0
      ? reminderBadgeClass.failed
      : reminderCounts.processing > 0
        ? reminderBadgeClass.processing
        : reminderCounts.sent === reminderStatuses.length
          ? reminderBadgeClass.sent
          : reminderCounts.pending === reminderStatuses.length
            ? reminderBadgeClass.pending
            : reminderBadgeClass.skipped;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", damping: 25, stiffness: 300 }}
      onClick={onCardClick}
      className="admin-glass-panel-soft reservations-mobile-card relative cursor-pointer overflow-hidden rounded-2xl transition-colors hover:border-primary/25"
    >
      {/* Top stripe */}
      <div className={cn("h-1 bg-gradient-to-r", stripeClass[reservation.status])} />

      <div className="p-3.5">
        {/* Header */}
        <div className="reservations-card-header">
          <div className="min-w-0">
            <p className="reservations-card-patient-name truncate">{reservation.clientName}</p>
            <p className="reservations-card-phone mt-0.5">{reservation.clientPhone}</p>
          </div>
          <Badge
            className={cn(
              "admin-chip reservations-card-status-badge border text-xs uppercase tracking-[0.09em]",
              statusBadgeClass[reservation.status],
            )}
          >
            {statusLabel[reservation.status]}
          </Badge>
        </div>

        {/* Appointment time */}
        <div className="reservations-card-appointment mt-2">
          <p className="reservations-card-appointment-time inline-flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {formatDateTime(reservation.appointmentAt)}
          </p>
        </div>

        <div className="reservations-card-divider mt-2.5" />

        {/* Status action */}
        <div className="mt-2.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Select value={draftStatus} onValueChange={(value) => onDraftStatusChange(value as ReservationStatus)}>
            <SelectTrigger className="admin-control h-11 flex-1 rounded-xl">
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
            className="reservations-card-save-btn h-11 min-w-[102px] rounded-xl bg-cyan-500/90 px-3 text-white hover:bg-cyan-500 disabled:opacity-45"
          >
            {isSaving ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-1.5 h-4 w-4" />
            )}
            <span className="text-[12px] font-semibold tracking-[0.02em]">{saveLabel}</span>
          </Button>
        </div>

        {/* Collapsible details */}
        <Collapsible>
          <CollapsibleTrigger
            className="reservations-card-disclosure mt-2.5 flex w-full items-center justify-between gap-2 rounded-xl border border-border/70 bg-white/55 px-2.5 py-2 text-left transition-colors hover:border-border/90 hover:bg-white/78"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <p className="reservations-card-disclosure-title">Delivery Details</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1">
                <Badge
                  className={cn(
                    "admin-chip border text-xs uppercase tracking-[0.08em]",
                    deliveryBadgeClass[reservation.confirmation.status],
                  )}
                >
                  {deliveryLabel[reservation.confirmation.status]}
                </Badge>
                <span className={cn("reservations-card-summary-pill", reminderSummaryClass)}>
                  {reminderSummaryLabel}
                </span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent onClick={(e) => e.stopPropagation()}>
            <div className="mt-2.5 space-y-2.5 rounded-xl border border-border/60 bg-white/45 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="reservations-card-section-label">Confirmation</p>
                <Badge
                  className={cn(
                    "admin-chip border text-xs uppercase tracking-[0.08em]",
                    deliveryBadgeClass[reservation.confirmation.status],
                  )}
                >
                  {deliveryLabel[reservation.confirmation.status]}
                </Badge>
              </div>

              <div className="reservations-card-subdivider" />

              <div>
                <p className="reservations-card-section-label mb-1.5">Reminders</p>
                <div className="space-y-1">
                  <ReminderChip label={reminderTypeLabel.r24h} status={reservation.reminders.r24h.status} />
                  <ReminderChip label={reminderTypeLabel.r3h} status={reservation.reminders.r3h.status} />
                  <ReminderChip label={reminderTypeLabel.r30m} status={reservation.reminders.r30m.status} />
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
