import { motion } from "framer-motion";
import { CalendarClock, Mail, MailCheck, MailX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  confirmationTextClass,
  deliveryLabel,
  formatDateTime,
  reminderDotColor,
  statusBadgeClass,
  statusLabel,
} from "@/lib/admin-constants";
import type { ReservationRow, ReservationStatus, ReminderStatus, DeliveryStatus } from "@/types/reservations";

interface ReservationCardProps {
  reservation: ReservationRow;
  onCardClick: () => void;
  index: number;
}

const stripeClass: Record<ReservationStatus, string> = {
  new: "bg-cyan-400",
  confirmed: "bg-emerald-400",
  completed: "bg-teal-400",
  cancelled: "bg-rose-400",
  no_show: "bg-amber-400",
};

const confIcon: Record<DeliveryStatus, typeof Mail> = {
  unknown: Mail,
  sent: MailCheck,
  failed: MailX,
  skipped: Mail,
};

const getReminderSummary = (statuses: ReminderStatus[]): string => {
  const failed = statuses.filter((s) => s === "failed").length;
  if (failed > 0) return `${failed} failed`;
  const sent = statuses.filter((s) => s === "sent").length;
  if (sent === statuses.length) return "all sent";
  if (sent > 0) return `${sent}/${statuses.length} sent`;
  const processing = statuses.filter((s) => s === "processing").length;
  if (processing > 0) return `${processing} processing`;
  return "pending";
};

const ReservationCard = ({
  reservation,
  onCardClick,
  index,
}: ReservationCardProps) => {
  const confStatus = reservation.confirmation.status;
  const ConfIcon = confIcon[confStatus];
  const reminderStatuses: ReminderStatus[] = [
    reservation.reminders.r24h?.status ?? "pending",
    reservation.reminders.r4h?.status ?? "pending",
  ];
  const summary = getReminderSummary(reminderStatuses);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", damping: 25, stiffness: 300 }}
      onClick={onCardClick}
      className="reservations-mobile-card relative cursor-pointer overflow-hidden rounded-2xl transition-colors"
    >
      {/* Left edge accent strip */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl", stripeClass[reservation.status])} />

      <div className="p-3.5 pl-4">
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
            <CalendarClock className="h-3.5 w-3.5 shrink-0 text-white/35" />
            {formatDateTime(reservation.appointmentAt)}
          </p>
        </div>

        <div className="reservations-card-divider mt-2.5" />

        {/* Notification status — compact inline row */}
        <div className="mt-2.5 flex items-center gap-2.5">
          {/* Confirmation */}
          <div className={cn("flex shrink-0 items-center gap-1", confirmationTextClass[confStatus])}>
            <ConfIcon className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium">{deliveryLabel[confStatus]}</span>
          </div>

          {/* Separator */}
          <div className="h-3 w-px bg-white/10" />

          {/* Reminder dots */}
          <div className="flex items-center gap-2">
            {(["r24h", "r4h"] as const).map((key) => (
              <div key={key} className="flex items-center gap-0.5">
                <span className={cn("h-1.5 w-1.5 rounded-full", reminderDotColor[reservation.reminders[key]?.status ?? "pending"])} />
                <span className="text-[9px] text-white/35">
                  {key === "r24h" ? "24h" : "4h"}
                </span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <span className="ml-auto text-[10px] font-mono text-white/30">
            {summary}
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export default ReservationCard;
