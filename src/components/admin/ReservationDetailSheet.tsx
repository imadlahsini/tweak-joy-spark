import { Check, ClipboardCopy, Loader2, Phone } from "lucide-react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  deliveryBadgeClass,
  deliveryLabel,
  formatDateOnly,
  formatRelativeTime,
  formatTimeOnly,
  reminderTypeLabel,
  reservationStatuses,
  statusDotClass,
  statusLabel,
} from "@/lib/admin-constants";
import type { ReservationRow, ReservationStatus, ReminderType } from "@/types/reservations";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ReservationDetailSheetProps {
  reservation: ReservationRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftStatus: ReservationStatus | undefined;
  onDraftStatusChange: (status: ReservationStatus) => void;
  onStatusSave: () => void;
  isSaving: boolean;
}

const timelineDotClass = {
  pending: "border-slate-400 bg-slate-300/35",
  processing: "border-blue-400 bg-blue-300/55 animate-pulse",
  sent: "border-emerald-400 bg-emerald-300/55",
  failed: "border-rose-400 bg-rose-300/55",
  skipped: "border-amber-400 bg-amber-300/55",
} as const;

const reminderOrder: ReminderType[] = ["r24h", "r3h", "r30m"];

const ReservationDetailSheet = ({
  reservation,
  open,
  onOpenChange,
  draftStatus,
  onDraftStatusChange,
  onStatusSave,
  isSaving,
}: ReservationDetailSheetProps) => {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState(false);

  if (!reservation) return null;

  const currentDraft = draftStatus ?? reservation.status;
  const statusChanged = currentDraft !== reservation.status;
  const isDestructive = currentDraft === "cancelled" || currentDraft === "no_show";

  const copyId = async () => {
    await navigator.clipboard.writeText(reservation.id);
    setCopiedId(true);
    toast({ title: "Copied", description: "Reservation ID copied to clipboard." });
    setTimeout(() => setCopiedId(false), 2000);
  };

  const SaveButton = () => (
    <Button
      size="sm"
      onClick={onStatusSave}
      disabled={!statusChanged || isSaving}
      className="h-12 w-12 shrink-0 rounded-xl bg-cyan-500/90 text-white hover:bg-cyan-500 disabled:opacity-35"
    >
      {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-l border-border/65 bg-[linear-gradient(162deg,rgba(255,255,255,0.95),rgba(241,248,252,0.92))] p-0 text-foreground backdrop-blur-2xl sm:max-w-[500px]"
      >
        <div className="p-6">
          {/* Header */}
          <SheetHeader className="border-b border-border/65 pb-5 text-left">
            <SheetTitle className="text-2xl font-bold tracking-tight text-foreground">
              {reservation.clientName}
            </SheetTitle>
            <a
              href={`tel:${reservation.clientPhone}`}
              className="mt-1 inline-flex w-fit items-center gap-1.5 font-mono text-sm text-cyan-700 transition-colors hover:text-cyan-800"
            >
              <Phone className="h-3.5 w-3.5" />
              {reservation.clientPhone}
            </a>

            <div className="admin-glass-panel-soft rounded-xl px-3 py-2.5 mt-3 flex items-baseline gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Date</p>
                <p className="text-lg font-semibold leading-tight text-foreground">
                  {formatDateOnly(reservation.appointmentAt)}
                </p>
              </div>
              <div className="h-8 w-px bg-border/70" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Time</p>
                <p className="text-lg font-semibold leading-tight text-cyan-700">
                  {formatTimeOnly(reservation.appointmentAt)}
                </p>
              </div>
              <span className="ml-auto rounded border border-border/70 bg-white/70 px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                {reservation.language}
              </span>
            </div>
          </SheetHeader>

          {/* Status section */}
          <div className="border-b border-border/65 py-5">
            <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Status</p>
            <div className="flex items-center gap-2">
              <Select
                value={currentDraft}
                onValueChange={(v) => onDraftStatusChange(v as ReservationStatus)}
              >
                <SelectTrigger className="admin-control h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reservationStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", statusDotClass[s])} />
                        {statusLabel[s]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isDestructive && statusChanged ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      disabled={isSaving}
                      className="h-12 w-12 shrink-0 rounded-xl bg-rose-500/85 text-white hover:bg-rose-500 disabled:opacity-35"
                    >
                      {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Check className="h-5 w-5" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="admin-glass-panel border-border/70 text-foreground">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        Change <strong className="text-foreground">{reservation.clientName}</strong>'s
                        status from{" "}
                        <strong className="text-foreground">{statusLabel[reservation.status]}</strong> to{" "}
                        <strong className="text-foreground">{statusLabel[currentDraft]}</strong>. This
                        will also skip any pending reminders.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="admin-control text-foreground hover:bg-white/80">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onStatusSave}
                        className="bg-rose-500 text-white hover:bg-rose-600"
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <SaveButton />
              )}
            </div>
          </div>

          {/* Confirmation section */}
          <div className="border-b border-border/65 py-5">
            <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Confirmation
            </p>
            <div className="flex items-center gap-3">
              <Badge
                className={cn(
                  "admin-chip border text-[12px] py-1 px-3",
                  deliveryBadgeClass[reservation.confirmation.status],
                )}
              >
                {deliveryLabel[reservation.confirmation.status]}
              </Badge>
            </div>
            {reservation.confirmation.sentAt && (
              <p className="mt-2 text-xs text-emerald-700">
                Sent at {formatRelativeTime(reservation.confirmation.sentAt)}
              </p>
            )}
            {reservation.confirmation.error && (
              <div className="mt-2 rounded-xl border border-rose-300/45 bg-rose-100/70 p-3 text-sm text-rose-700">
                {reservation.confirmation.error}
              </div>
            )}
          </div>

          {/* Reminders timeline */}
          <div className="py-5">
            <p className="mb-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Reminders
            </p>
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute bottom-1 left-3 top-1 w-px bg-gradient-to-b from-slate-400/60 via-slate-300/50 to-transparent" />

              {reminderOrder.map((type, i) => {
                const reminder = reservation.reminders[type];
                return (
                  <div key={type} className={cn("relative", i < 2 ? "pb-6" : "pb-0")}>
                    {/* Dot */}
                    <div
                      className={cn(
                        "absolute left-[-25px] w-3 h-3 rounded-full border-2",
                        timelineDotClass[reminder.status],
                      )}
                    />

                    {/* Content */}
                    <div className="ml-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {reminderTypeLabel[type]}
                        </span>
                        <Badge
                          className={cn(
                            "admin-chip border text-[10px] py-0 px-1.5",
                            timelineDotClass[reminder.status].includes("emerald")
                              ? "border-emerald-300/45 bg-emerald-200/55 text-emerald-700"
                              : timelineDotClass[reminder.status].includes("rose")
                                ? "border-rose-300/45 bg-rose-200/55 text-rose-700"
                                : timelineDotClass[reminder.status].includes("blue")
                                  ? "border-blue-300/45 bg-blue-200/55 text-blue-700"
                                  : timelineDotClass[reminder.status].includes("amber")
                                    ? "border-amber-300/45 bg-amber-200/55 text-amber-700"
                                    : "border-slate-300/45 bg-slate-200/65 text-slate-700",
                          )}
                        >
                          {reminder.status}
                        </Badge>
                      </div>

                      {reminder.scheduledFor && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Scheduled for {formatRelativeTime(reminder.scheduledFor)}
                        </p>
                      )}
                      {reminder.sentAt && (
                        <p className="mt-0.5 text-xs text-emerald-700">
                          Sent at {formatRelativeTime(reminder.sentAt)}
                        </p>
                      )}
                      {reminder.lastError && (
                        <p className="mt-0.5 text-xs text-rose-700">{reminder.lastError}</p>
                      )}
                      {reminder.attempts > 0 && (
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {reminder.attempts} attempt(s)
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/65 pt-4">
            <p className="text-xs text-muted-foreground">
              Updated {formatRelativeTime(reservation.updatedAt)}
            </p>
            <button
              type="button"
              onClick={copyId}
              className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {copiedId ? "Copied!" : reservation.id.slice(0, 8)}
              <ClipboardCopy className="h-3 w-3" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ReservationDetailSheet;
