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
}: ReservationsTableProps) => {
  return (
    <div className="reservations-table-shell admin-glass-panel-soft rounded-[22px]">
      <Table className="min-w-[1080px] table-fixed">
        <colgroup>
          <col style={{ width: "190px" }} />
          <col style={{ width: "220px" }} />
          <col style={{ width: "180px" }} />
          <col style={{ width: "250px" }} />
          <col style={{ width: "240px" }} />
        </colgroup>

        <TableHeader className="sticky top-0 z-20">
          <TableRow className="border-border/70 bg-[hsl(var(--reservation-table-head)/0.95)] hover:bg-[hsl(var(--reservation-table-head)/0.95)]">
            <TableHead className="reservations-table-head px-4">Time</TableHead>
            <TableHead className="reservations-table-head px-4">Patient</TableHead>
            <TableHead className="reservations-table-head px-4">Contact</TableHead>
            <TableHead className="reservations-table-head px-4">Status Workflow</TableHead>
            <TableHead className="reservations-table-head px-4">Confirmation & Reminders</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {reservations.map((reservation, index) => {
            const draftStatus = draftStatusById[reservation.id] ?? reservation.status;
            const statusChanged = draftStatus !== reservation.status;
            const isSaving = Boolean(savingById[reservation.id]);
            const saveLabel = isSaving ? "Saving" : statusChanged ? "Save" : "Saved";

            return (
              <motion.tr
                key={reservation.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03, duration: 0.28 }}
                onClick={() => onRowClick(reservation)}
                className={cn(
                  "group cursor-pointer border-b border-border/60 align-top transition-all duration-150 hover:bg-white/58 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--reservation-focus)/0.45)] focus-visible:ring-offset-0",
                )}
              >
                <TableCell className="px-4 py-4 align-top">
                  <div
                    className={cn(
                      "relative pl-3 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:rounded-full",
                      rowAccentClass[reservation.status],
                    )}
                  >
                    <p className="text-sm font-semibold text-foreground">{formatDateTime(reservation.appointmentAt)}</p>
                    <span className="mt-1 inline-flex rounded-md border border-border/70 bg-white/65 px-1.5 py-0.5 text-xs uppercase text-muted-foreground">
                      {reservation.language}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-4 align-top">
                  <p className="text-[14px] font-semibold text-foreground">{reservation.clientName}</p>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Patient
                  </p>
                </TableCell>

                <TableCell className="px-4 py-4 align-top">
                  <p className="font-mono text-xs text-foreground/85">{reservation.clientPhone}</p>
                </TableCell>

                <TableCell className="px-4 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Select
                      value={draftStatus}
                      onValueChange={(value) =>
                        onDraftStatusChange(reservation.id, value as ReservationStatus)
                      }
                    >
                      <SelectTrigger className="admin-control h-9 flex-1">
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
                      className="h-9 min-w-[78px] shrink-0 rounded-lg bg-cyan-500/90 px-2.5 text-white hover:bg-cyan-500 disabled:opacity-45"
                    >
                      {isSaving ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-1.5 h-4 w-4" />
                      )}
                      <span className="text-xs">{saveLabel}</span>
                    </Button>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-4 align-top">
                  <div className="space-y-2">
                    <Badge
                      className={cn(
                        "admin-chip border text-xs uppercase tracking-[0.08em]",
                        deliveryBadgeClass[reservation.confirmation.status],
                      )}
                    >
                      {deliveryLabel[reservation.confirmation.status]}
                    </Badge>
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
