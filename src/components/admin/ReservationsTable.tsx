import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface ReservationsTableProps {
  reservations: ReservationRow[];
  draftStatusById: Record<string, ReservationStatus>;
  savingById: Record<string, boolean>;
  onDraftStatusChange: (id: string, status: ReservationStatus) => void;
  onStatusSave: (reservation: ReservationRow) => void;
  onRowClick: (reservation: ReservationRow) => void;
}

const ReminderChip = ({
  label,
  status,
}: {
  label: string;
  status: ReminderStatus;
}) => (
  <div className={cn("admin-chip border", reminderBadgeClass[status])}>
    <span className="font-semibold">{label}</span> {status}
  </div>
);

const rowAccentClass: Record<ReservationStatus, string> = {
  new: "before:bg-cyan-400",
  confirmed: "before:bg-emerald-400",
  completed: "before:bg-teal-400",
  cancelled: "before:bg-rose-400",
  no_show: "before:bg-amber-400",
};

const ReservationsTable = ({
  reservations,
  draftStatusById,
  savingById,
  onDraftStatusChange,
  onStatusSave,
  onRowClick,
}: ReservationsTableProps) => (
  <div className="admin-glass-panel-soft overflow-hidden rounded-2xl">
    <Table className="min-w-[980px] table-fixed">
      <colgroup>
        <col className="w-[24%]" />
        <col className="w-[24%]" />
        <col className="w-[22%]" />
        <col className="w-[16%]" />
        <col className="w-[14%]" />
      </colgroup>
      <TableHeader>
        <TableRow className="border-border/70 bg-white/55 hover:bg-white/55">
          <TableHead className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Patient
          </TableHead>
          <TableHead className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Appointment
          </TableHead>
          <TableHead className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Status
          </TableHead>
          <TableHead className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Confirmation
          </TableHead>
          <TableHead className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Reminders
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservations.map((reservation, index) => {
          const draftStatus = draftStatusById[reservation.id] ?? reservation.status;
          const statusChanged = draftStatus !== reservation.status;
          const isSaving = Boolean(savingById[reservation.id]);

          return (
            <motion.tr
              key={reservation.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              onClick={() => onRowClick(reservation)}
              className={cn(
                "relative cursor-pointer border-b border-border/60 transition-all duration-150 hover:bg-white/58",
                "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full",
                rowAccentClass[reservation.status],
              )}
            >
              <TableCell className="px-4 py-4 align-top pl-5">
                <p className="text-[14px] font-semibold text-foreground">{reservation.clientName}</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{reservation.clientPhone}</p>
              </TableCell>

              <TableCell className="px-4 py-4 align-top">
                <p className="font-medium text-foreground">{formatDateTime(reservation.appointmentAt)}</p>
                <span className="mt-1 inline-block rounded border border-border/70 bg-white/65 px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                  {reservation.language}
                </span>
              </TableCell>

              <TableCell className="px-4 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                <div className="flex max-w-[250px] items-center gap-2">
                  <Select
                    value={draftStatus}
                    onValueChange={(value) =>
                      onDraftStatusChange(reservation.id, value as ReservationStatus)
                    }
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
                    onClick={() => onStatusSave(reservation)}
                    disabled={!statusChanged || isSaving}
                    className="h-9 w-9 shrink-0 rounded-lg bg-cyan-500/90 text-white hover:bg-cyan-500 disabled:opacity-35"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>

              <TableCell className="px-4 py-4 align-top">
                <Badge
                  className={cn(
                    "admin-chip border",
                    deliveryBadgeClass[reservation.confirmation.status],
                  )}
                >
                  {deliveryLabel[reservation.confirmation.status]}
                </Badge>
              </TableCell>

              <TableCell className="px-4 py-4 align-top">
                <div className="flex flex-wrap gap-1">
                  <ReminderChip
                    label={reminderTypeLabel.r24h}
                    status={reservation.reminders.r24h.status}
                  />
                  <ReminderChip
                    label={reminderTypeLabel.r3h}
                    status={reservation.reminders.r3h.status}
                  />
                  <ReminderChip
                    label={reminderTypeLabel.r30m}
                    status={reservation.reminders.r30m.status}
                  />
                </div>
              </TableCell>
            </motion.tr>
          );
        })}
      </TableBody>
    </Table>
  </div>
);

export default ReservationsTable;
