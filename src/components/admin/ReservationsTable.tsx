import { motion } from "framer-motion";
import { Mail, MailCheck, MailX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  confirmationTextClass,
  deliveryLabel,
  formatDateTime,
  reminderDotColor,
} from "@/lib/admin-constants";
import type { ReservationRow, ReservationStatus, ReminderStatus, DeliveryStatus } from "@/types/reservations";

interface ReservationsTableProps {
  reservations: ReservationRow[];
  onRowClick: (reservation: ReservationRow) => void;
}

const confirmationIcon: Record<DeliveryStatus, typeof Mail> = {
  unknown: Mail,
  sent: MailCheck,
  failed: MailX,
  skipped: Mail,
};

const ReminderDot = ({ label, status }: { label: string; status: ReminderStatus }) => (
  <div className="flex items-center gap-1" title={`${label}: ${status}`}>
    <span className={cn("h-2 w-2 shrink-0 rounded-full", reminderDotColor[status])} />
    <span className="text-[10px] text-white/40">{label}</span>
  </div>
);

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

const rowAccentClass: Record<ReservationStatus, string> = {
  new: "before:bg-cyan-400",
  confirmed: "before:bg-emerald-400",
  completed: "before:bg-teal-400",
  cancelled: "before:bg-rose-400",
  no_show: "before:bg-amber-400",
};

const ReservationsTable = ({
  reservations,
  onRowClick,
}: ReservationsTableProps) => {
  return (
    <div className="reservations-table-shell">
      <Table className="min-w-[820px] table-fixed">
        <colgroup>
          <col style={{ width: "220px" }} />
          <col style={{ width: "240px" }} />
          <col style={{ width: "200px" }} />
          <col style={{ width: "280px" }} />
        </colgroup>

        <TableHeader className="sticky top-0 z-20">
          <TableRow className="border-white/8 bg-white/[0.03] hover:bg-white/[0.03]">
            <TableHead className="reservations-table-head px-4">Time</TableHead>
            <TableHead className="reservations-table-head px-4">Patient</TableHead>
            <TableHead className="reservations-table-head px-4">Contact</TableHead>
            <TableHead className="reservations-table-head px-4">Notifications</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {reservations.map((reservation, index) => {
            const confStatus = reservation.confirmation.status;
            const ConfIcon = confirmationIcon[confStatus];
            const reminderStatuses: ReminderStatus[] = [
              reservation.reminders.r24h?.status ?? "pending",
              reservation.reminders.r4h?.status ?? "pending",
            ];
            const summary = getReminderSummary(reminderStatuses);

            return (
              <motion.tr
                key={reservation.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.28, ease: "easeOut" }}
                onClick={() => onRowClick(reservation)}
                className={cn(
                  "group cursor-pointer border-b border-white/[0.06] align-top transition-all duration-150 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(109,181,255,0.45)] focus-visible:ring-offset-0",
                )}
              >
                <TableCell className="px-4 py-4 align-top">
                  <div
                    className={cn(
                      "relative pl-3 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:rounded-full",
                      rowAccentClass[reservation.status],
                    )}
                  >
                    <p className="text-sm font-semibold text-white/90">{formatDateTime(reservation.appointmentAt)}</p>
                    <span className="mt-1 inline-flex rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-xs uppercase text-white/40">
                      {reservation.language}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-4 align-top">
                  <p className="text-[14px] font-semibold text-white/92">{reservation.clientName}</p>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-white/35">
                    Patient
                  </p>
                </TableCell>

                <TableCell className="px-4 py-4 align-top">
                  <p className="font-mono text-xs text-white/70">{reservation.clientPhone}</p>
                </TableCell>

                <TableCell className="px-4 py-4 align-middle">
                  <div className="flex items-center gap-3">
                    {/* Confirmation status */}
                    <div className={cn("flex shrink-0 items-center gap-1.5", confirmationTextClass[confStatus])}>
                      <ConfIcon className="h-3.5 w-3.5" />
                      <span className="text-[12px] font-medium">{deliveryLabel[confStatus]}</span>
                    </div>

                    {/* Separator */}
                    <div className="h-3.5 w-px bg-white/10" />

                    {/* Reminder dots */}
                    <div className="flex items-center gap-2.5">
                      <ReminderDot label="24h" status={reservation.reminders.r24h?.status ?? "pending"} />
                      <ReminderDot label="4h" status={reservation.reminders.r4h?.status ?? "pending"} />
                    </div>

                    {/* Summary */}
                    <span className="ml-auto shrink-0 text-[11px] font-mono text-white/35">
                      {summary}
                    </span>
                  </div>
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReservationsTable;
