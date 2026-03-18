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
  new: "border-cyan-400/35 bg-cyan-500/12 text-cyan-700",
  confirmed: "border-emerald-400/35 bg-emerald-500/12 text-emerald-700",
  completed: "border-teal-400/35 bg-teal-500/12 text-teal-700",
  cancelled: "border-rose-400/35 bg-rose-500/12 text-rose-700",
  no_show: "border-amber-400/35 bg-amber-500/12 text-amber-700",
};

export const statusDotClass: Record<ReservationStatus, string> = {
  new: "bg-cyan-400",
  confirmed: "bg-emerald-400",
  completed: "bg-teal-400",
  cancelled: "bg-rose-400",
  no_show: "bg-amber-400",
};

export const statusIconPlateClass: Record<ReservationStatus, string> = {
  new: "border-cyan-400/35 bg-cyan-500/12 text-cyan-600",
  confirmed: "border-emerald-400/35 bg-emerald-500/12 text-emerald-600",
  completed: "border-teal-400/35 bg-teal-500/12 text-teal-600",
  cancelled: "border-rose-400/35 bg-rose-500/12 text-rose-600",
  no_show: "border-amber-400/35 bg-amber-500/12 text-amber-600",
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
      plate: "border-cyan-400/35 bg-cyan-500/12 text-cyan-600",
      glow: "bg-cyan-500/12",
    },
    getValue: (s) => s.total,
  },
  {
    key: "today",
    label: "Today",
    icon: CalendarDays,
    colorClasses: {
      plate: "border-teal-400/35 bg-teal-500/12 text-teal-600",
      glow: "bg-teal-500/12",
    },
    getValue: (s) => s.todayCount,
  },
  {
    key: "new",
    label: "New",
    icon: Sparkles,
    colorClasses: {
      plate: "border-cyan-400/35 bg-cyan-500/12 text-cyan-600",
      glow: "bg-cyan-500/12",
    },
    getValue: (s) => s.byStatus.new,
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
    colorClasses: {
      plate: "border-emerald-400/35 bg-emerald-500/12 text-emerald-600",
      glow: "bg-emerald-500/12",
    },
    getValue: (s) => s.byStatus.confirmed,
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    colorClasses: {
      plate: "border-rose-400/35 bg-rose-500/12 text-rose-600",
      glow: "bg-rose-500/12",
    },
    getValue: (s) => s.byStatus.cancelled,
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
  unknown: "border-slate-400/35 bg-slate-500/10 text-slate-700",
  sent: "border-emerald-400/35 bg-emerald-500/12 text-emerald-700",
  failed: "border-rose-400/35 bg-rose-500/12 text-rose-700",
  skipped: "border-amber-400/35 bg-amber-500/12 text-amber-700",
};

export const reminderTypeLabel: Record<ReminderType, string> = {
  r24h: "24h",
  r3h: "3h",
  r30m: "30m",
};

export const reminderBadgeClass: Record<ReminderStatus, string> = {
  pending: "border-slate-400/35 bg-slate-500/10 text-slate-700",
  processing: "border-blue-400/35 bg-blue-500/12 text-blue-700",
  sent: "border-emerald-400/35 bg-emerald-500/12 text-emerald-700",
  failed: "border-rose-400/35 bg-rose-500/12 text-rose-700",
  skipped: "border-amber-400/35 bg-amber-500/12 text-amber-700",
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
