import { Check, ClipboardCopy, Loader2, Phone, Send, SkipForward } from "lucide-react";
import { Link } from "react-router-dom";
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
  profileHref?: string | null;
  onSkipReminder?: (reservationId: string, reminderType: ReminderType) => Promise<void>;
  onResendReminder?: (reservationId: string, reminderType: ReminderType) => Promise<void>;
  onResendConfirmation?: (reservationId: string) => Promise<void>;
}

const timelineDotClass = {
  pending: "border-slate-400/50 bg-slate-400/20",
  processing: "border-blue-400/50 bg-blue-400/20 animate-pulse",
  sent: "border-emerald-400/50 bg-emerald-400/20",
  failed: "border-rose-400/50 bg-rose-400/20",
  skipped: "border-amber-400/50 bg-amber-400/20",
} as const;

const reminderOrder: ReminderType[] = ["r24h", "r4h"];

const ReservationDetailSheet = ({
  reservation,
  open,
  onOpenChange,
  draftStatus,
  onDraftStatusChange,
  onStatusSave,
  isSaving,
  profileHref,
  onSkipReminder,
  onResendReminder,
  onResendConfirmation,
}: ReservationDetailSheetProps) => {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState(false);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [reminderLoading, setReminderLoading] = useState<Record<string, boolean>>({});

  const handleResendConfirmation = async () => {
    if (!onResendConfirmation || !reservation || confirmationLoading) return;
    setConfirmationLoading(true);
    try {
      await onResendConfirmation(reservation.id);
    } finally {
      setConfirmationLoading(false);
    }
  };

  const handleSkipReminder = async (type: ReminderType) => {
    if (!onSkipReminder || !reservation || reminderLoading[type]) return;
    setReminderLoading((c) => ({ ...c, [type]: true }));
    try {
      await onSkipReminder(reservation.id, type);
    } finally {
      setReminderLoading((c) => ({ ...c, [type]: false }));
    }
  };

  const handleResendReminder = async (type: ReminderType) => {
    if (!onResendReminder || !reservation || reminderLoading[type]) return;
    setReminderLoading((c) => ({ ...c, [type]: true }));
    try {
      await onResendReminder(reservation.id, type);
    } finally {
      setReminderLoading((c) => ({ ...c, [type]: false }));
    }
  };

  if (!reservation) return null;

  const currentDraft = draftStatus ?? reservation.status;
  const statusChanged = currentDraft !== reservation.status;
  const isDestructive = currentDraft === "cancelled" || currentDraft === "no_show";
  const saveLabel = isSaving ? "Saving" : statusChanged ? "Save" : "Saved";

  const copyId = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(reservation.id);
      setCopiedId(true);
      toast({ title: "Copied", description: "Reservation ID copied to clipboard." });
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Clipboard access is blocked in this browser. Please copy it manually.",
        variant: "destructive",
      });
    }
  };

  const SaveButton = () => (
    <Button
      size="sm"
      onClick={onStatusSave}
      disabled={!statusChanged || isSaving}
      className="h-12 min-w-[108px] shrink-0 rounded-xl bg-cyan-500/90 px-3.5 text-white hover:bg-cyan-500 disabled:opacity-35"
    >
      {isSaving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Check className="mr-1.5 h-4 w-4" />}
      <span className="text-xs font-semibold tracking-[0.02em]">{saveLabel}</span>
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="reservations-drawer w-full overflow-y-auto border-l border-white/10 p-0 text-white backdrop-blur-2xl sm:max-w-[560px]"
      >
        <div className="p-6">
          {/* Header */}
          <SheetHeader className="border-b border-white/8 pb-5 text-left">
            <SheetTitle className="text-2xl font-bold tracking-tight text-white">
              {reservation.clientName}
            </SheetTitle>
            <a
              href={`tel:${reservation.clientPhone}`}
              className="mt-1 inline-flex w-fit items-center gap-1.5 font-mono text-sm text-cyan-400 transition-colors hover:text-cyan-300"
            >
              <Phone className="h-3.5 w-3.5" />
              {reservation.clientPhone}
            </a>
            {profileHref && (
              <Button asChild variant="ghost" className="reservation-detail-profile-link mt-3 h-9 rounded-lg px-3 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300">
                <Link to={profileHref}>Open Profile</Link>
              </Button>
            )}

            <div className="mt-3 flex items-baseline gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/35">Date</p>
                <p className="text-lg font-semibold leading-tight text-white">
                  {formatDateOnly(reservation.appointmentAt)}
                </p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-xs uppercase tracking-wider text-white/35">Time</p>
                <p className="text-lg font-semibold leading-tight text-cyan-400">
                  {formatTimeOnly(reservation.appointmentAt)}
                </p>
              </div>
              <span className="ml-auto rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-xs uppercase text-white/40">
                {reservation.language}
              </span>
            </div>
          </SheetHeader>

          {/* Status section */}
          <div className="reservations-drawer-section border-b border-white/8 py-5">
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-white/35">Status</p>
            <div className="flex items-center gap-2">
              <Select
                value={currentDraft}
                onValueChange={(v) => onDraftStatusChange(v as ReservationStatus)}
              >
                <SelectTrigger className="h-12 text-base border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07] focus:border-[#6DB5FF]/50 focus:ring-[#6DB5FF]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/12 bg-[#1A1A1E] text-white/85">
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
                      className="h-12 min-w-[108px] shrink-0 rounded-xl bg-rose-500/85 px-3.5 text-white hover:bg-rose-500 disabled:opacity-35"
                    >
                      {isSaving ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-1.5 h-4 w-4" />
                      )}
                      <span className="text-xs font-semibold tracking-[0.02em]">{saveLabel}</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    style={{ position: "fixed" }}
                    className="border-white/12 bg-[#1A1A1E] text-white"
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-white/50">
                        Change <strong className="text-white">{reservation.clientName}</strong>'s
                        status from{" "}
                        <strong className="text-white">{statusLabel[reservation.status]}</strong> to{" "}
                        <strong className="text-white">{statusLabel[currentDraft]}</strong>. This
                        will also skip any pending reminders.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]">
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
          <div className="reservations-drawer-section border-b border-white/8 py-5">
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-white/35">
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
              {onResendConfirmation && (reservation.confirmation.status === "failed" || reservation.confirmation.status === "skipped") && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleResendConfirmation}
                  disabled={confirmationLoading}
                  className="h-7 gap-1.5 rounded-lg px-2.5 text-xs text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                >
                  {confirmationLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  Resend
                </Button>
              )}
              {onResendConfirmation && reservation.confirmation.status === "sent" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleResendConfirmation}
                  disabled={confirmationLoading}
                  className="h-7 gap-1.5 rounded-lg px-2.5 text-xs text-white/30 hover:bg-white/5 hover:text-white/50"
                >
                  {confirmationLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  Resend
                </Button>
              )}
            </div>
            {reservation.confirmation.sentAt && (
              <p className="mt-2 text-xs text-emerald-400">
                Sent at {formatRelativeTime(reservation.confirmation.sentAt)}
              </p>
            )}
            {reservation.confirmation.error && (
              <div className="mt-2 rounded-xl border border-[#FF6B6B]/25 bg-[#FF6B6B]/10 p-3 text-sm text-[#FF6B6B]">
                {reservation.confirmation.error}
              </div>
            )}
          </div>

          {/* Reminders timeline */}
          <div className="reservations-drawer-section py-5">
            <p className="mb-4 text-xs uppercase tracking-[0.16em] text-white/35">
              Reminders
            </p>
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute bottom-1 left-3 top-1 w-px bg-gradient-to-b from-white/15 via-white/8 to-transparent" />

              {reminderOrder.map((type, i) => {
                const reminder = reservation.reminders[type] ?? { status: "pending" as const, attempts: 0, scheduledFor: null, sentAt: null, lastError: null };
                return (
                  <div key={type} className={cn("relative", i < reminderOrder.length - 1 ? "pb-6" : "pb-0")}>
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
                        <span className="text-sm font-semibold text-white">
                          {reminderTypeLabel[type]}
                        </span>
                        <Badge
                          className={cn(
                            "admin-chip border px-1.5 py-0 text-xs",
                            timelineDotClass[reminder.status].includes("emerald")
                              ? "border-emerald-400/25 bg-emerald-400/15 text-emerald-400"
                              : timelineDotClass[reminder.status].includes("rose")
                                ? "border-rose-400/25 bg-rose-400/15 text-rose-400"
                                : timelineDotClass[reminder.status].includes("blue")
                                  ? "border-blue-400/25 bg-blue-400/15 text-blue-400"
                                  : timelineDotClass[reminder.status].includes("amber")
                                    ? "border-amber-400/25 bg-amber-400/15 text-amber-400"
                                    : "border-slate-400/25 bg-slate-400/15 text-slate-400",
                          )}
                        >
                          {reminder.status}
                        </Badge>
                      </div>

                      {reminder.scheduledFor && (
                        <p className="mt-1 text-xs text-white/40">
                          Scheduled for {formatRelativeTime(reminder.scheduledFor)}
                        </p>
                      )}
                      {reminder.sentAt && (
                        <p className="mt-0.5 text-xs text-emerald-400">
                          Sent at {formatRelativeTime(reminder.sentAt)}
                        </p>
                      )}
                      {reminder.lastError && (
                        <p className="mt-0.5 text-xs text-rose-400">{reminder.lastError}</p>
                      )}
                      {reminder.attempts > 0 && (
                        <p className="mt-0.5 font-mono text-xs text-white/30">
                          {reminder.attempts} attempt(s)
                        </p>
                      )}
                      {/* Action buttons */}
                      <div className="mt-1.5 flex gap-1.5">
                        {(reminder.status === "pending" || reminder.status === "processing") && onSkipReminder && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSkipReminder(type)}
                            disabled={!!reminderLoading[type]}
                            className="h-6 gap-1 rounded-md px-2 text-[11px] text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                          >
                            {reminderLoading[type] ? <Loader2 className="h-3 w-3 animate-spin" /> : <SkipForward className="h-3 w-3" />}
                            Skip
                          </Button>
                        )}
                        {(reminder.status === "failed" || reminder.status === "skipped") && onResendReminder && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleResendReminder(type)}
                            disabled={!!reminderLoading[type]}
                            className="h-6 gap-1 rounded-md px-2 text-[11px] text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                          >
                            {reminderLoading[type] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                            Resend
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/8 pt-4">
            <p className="text-xs text-white/35">
              Updated {formatRelativeTime(reservation.updatedAt)}
            </p>
            <button
              type="button"
              onClick={copyId}
              className="inline-flex items-center gap-1 font-mono text-xs text-white/35 transition-colors hover:text-white"
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
