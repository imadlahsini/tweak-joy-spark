import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleCheckBig,
  Sparkles,
  UserX,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type {
  DeliveryStatus,
  ReminderStatus,
  ReminderType,
  ReservationRow,
  ReservationStatus,
} from "@/types/reservations";

/* ------------------------------------------------------------------ */
/*  Response types (from Supabase edge functions)                     */
/* ------------------------------------------------------------------ */

export type FetchReservationsResponse = {
  reservations: ReservationRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
};

export type UpdateReservationStatusResponse = {
  reservation: ReservationRow;
  remindersAutoSkipped: number;
};

/* ------------------------------------------------------------------ */
/*  Status constants                                                  */
/* ------------------------------------------------------------------ */

export const reservationStatuses: ReservationStatus[] = [
  "new",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

export const statusLabel: Record<ReservationStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export const statusBadgeClass: Record<ReservationStatus, string> = {
  new: "border-cyan-400/25 bg-cyan-500/15 text-cyan-400",
  confirmed: "border-emerald-400/25 bg-emerald-500/15 text-emerald-400",
  completed: "border-teal-400/25 bg-teal-500/15 text-teal-400",
  cancelled: "border-rose-400/25 bg-rose-500/15 text-rose-400",
  no_show: "border-amber-400/25 bg-amber-500/15 text-amber-400",
};

export const statusDotClass: Record<ReservationStatus, string> = {
  new: "bg-cyan-400",
  confirmed: "bg-emerald-400",
  completed: "bg-teal-400",
  cancelled: "bg-rose-400",
  no_show: "bg-amber-400",
};

export const statusIconPlateClass: Record<ReservationStatus, string> = {
  new: "border-cyan-400/25 bg-cyan-500/15 text-cyan-400",
  confirmed: "border-emerald-400/25 bg-emerald-500/15 text-emerald-400",
  completed: "border-teal-400/25 bg-teal-500/15 text-teal-400",
  cancelled: "border-rose-400/25 bg-rose-500/15 text-rose-400",
  no_show: "border-amber-400/25 bg-amber-500/15 text-amber-400",
};

export const statusIcon: Record<ReservationStatus, LucideIcon> = {
  new: Sparkles,
  confirmed: CheckCircle2,
  completed: CircleCheckBig,
  cancelled: XCircle,
  no_show: UserX,
};

/* ------------------------------------------------------------------ */
/*  Stats card definitions                                            */
/* ------------------------------------------------------------------ */

export type StatCardDef = {
  key: string;
  label: string;
  icon: LucideIcon;
  colorClasses: { plate: string; glow: string };
  getValue: (stats: ReservationStats) => number;
  getContext?: (stats: ReservationStats) => string;
};

export type ReservationStats = {
  total: number;
  todayCount: number;
  byStatus: Record<ReservationStatus, number>;
};

export const statCards: StatCardDef[] = [
  {
    key: "total",
    label: "Total",
    icon: BarChart3,
    colorClasses: {
      plate: "border-cyan-400/25 bg-cyan-500/15 text-cyan-400",
      glow: "bg-cyan-500/15",
    },
    getValue: (s) => s.total,
    getContext: () => "In active date range",
  },
  {
    key: "today",
    label: "Today",
    icon: CalendarDays,
    colorClasses: {
      plate: "border-teal-400/25 bg-teal-500/15 text-teal-400",
      glow: "bg-teal-500/15",
    },
    getValue: (s) => s.todayCount,
    getContext: () => "Scheduled in Casablanca",
  },
  {
    key: "new",
    label: "New",
    icon: Sparkles,
    colorClasses: {
      plate: "border-cyan-400/25 bg-cyan-500/15 text-cyan-400",
      glow: "bg-cyan-500/15",
    },
    getValue: (s) => s.byStatus.new,
    getContext: () => "Needs review",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
    colorClasses: {
      plate: "border-emerald-400/25 bg-emerald-500/15 text-emerald-400",
      glow: "bg-emerald-500/15",
    },
    getValue: (s) => s.byStatus.confirmed,
    getContext: () => "Ready to attend",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    colorClasses: {
      plate: "border-rose-400/25 bg-rose-500/15 text-rose-400",
      glow: "bg-rose-500/15",
    },
    getValue: (s) => s.byStatus.cancelled,
    getContext: () => "Excluded from active flow",
  },
];

/* ------------------------------------------------------------------ */
/*  Delivery / reminder maps                                          */
/* ------------------------------------------------------------------ */

export const deliveryLabel: Record<DeliveryStatus, string> = {
  unknown: "Unknown",
  sent: "Sent",
  failed: "Failed",
  skipped: "Skipped",
};

export const deliveryBadgeClass: Record<DeliveryStatus, string> = {
  unknown: "border-slate-400/25 bg-slate-500/15 text-slate-400",
  sent: "border-emerald-400/25 bg-emerald-500/15 text-emerald-400",
  failed: "border-rose-400/25 bg-rose-500/15 text-rose-400",
  skipped: "border-amber-400/25 bg-amber-500/15 text-amber-400",
};

export const reminderTypeLabel: Record<ReminderType, string> = {
  r24h: "24h",
  r4h: "4h",
};

export const reminderBadgeClass: Record<ReminderStatus, string> = {
  pending: "border-slate-400/25 bg-slate-500/15 text-slate-400",
  processing: "border-blue-400/25 bg-blue-500/15 text-blue-400",
  sent: "border-emerald-400/25 bg-emerald-500/15 text-emerald-400",
  failed: "border-rose-400/25 bg-rose-500/15 text-rose-400",
  skipped: "border-amber-400/25 bg-amber-500/15 text-amber-400",
};

export const reminderDotColor: Record<ReminderStatus, string> = {
  pending: "bg-white/25",
  processing: "bg-blue-400",
  sent: "bg-emerald-400",
  failed: "bg-rose-400",
  skipped: "bg-amber-400",
};

export const confirmationTextClass: Record<DeliveryStatus, string> = {
  unknown: "text-slate-400",
  sent: "text-emerald-400",
  failed: "text-rose-400",
  skipped: "text-amber-400",
};

/* ------------------------------------------------------------------ */
/*  Formatters                                                        */
/* ------------------------------------------------------------------ */

export const formatDateTime = (isoValue: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  }).format(new Date(isoValue));

export const formatRelativeTime = (isoValue: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  }).format(new Date(isoValue));

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const formatRelativeFromNow = (
  value: Date | string | null,
  nowMs: number = Date.now(),
): string => {
  if (!value) return "Not updated yet";
  const targetMs = value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (Number.isNaN(targetMs)) return "Not updated yet";

  const diffSeconds = Math.round((targetMs - nowMs) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 8) return "just now";
  if (absSeconds < 60) return relativeTimeFormatter.format(diffSeconds, "second");

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return relativeTimeFormatter.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return relativeTimeFormatter.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 31) return relativeTimeFormatter.format(diffDays, "day");

  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) return relativeTimeFormatter.format(diffMonths, "month");

  const diffYears = Math.round(diffMonths / 12);
  return relativeTimeFormatter.format(diffYears, "year");
};

export const formatDateOnly = (isoValue: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Casablanca",
  }).format(new Date(isoValue));

export const formatTimeOnly = (isoValue: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  }).format(new Date(isoValue));

/* ------------------------------------------------------------------ */
/*  Error helpers                                                     */
/* ------------------------------------------------------------------ */

export const getErrorStatusCode = (error: unknown): number | null => {
  if (!error || typeof error !== "object") return null;
  const candidate = error as {
    status?: number;
    context?: { status?: number } | Response;
  };
  if (typeof candidate.status === "number") return candidate.status;
  if (
    candidate.context &&
    typeof candidate.context === "object" &&
    "status" in candidate.context
  ) {
    const status = (candidate.context as { status?: number }).status;
    if (typeof status === "number") return status;
  }
  return null;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Unexpected error";
};
