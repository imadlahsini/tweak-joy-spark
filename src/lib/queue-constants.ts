import {
  CalendarClock,
  Clock,
  CheckCircle2,
  Hourglass,
  Stethoscope,
  UserX,
  Users2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { QueueColumnId, QueuePatientStatus } from "@/types/queue";

/* ------------------------------------------------------------------ */
/*  Status constants                                                   */
/* ------------------------------------------------------------------ */

export const queueStatuses: QueuePatientStatus[] = [
  "waiting",
  "with_medecin",
  "completed",
  "no_show",
  "cancelled",
];

export const queueStatusLabel: Record<QueuePatientStatus, string> = {
  waiting: "Waiting",
  with_medecin: "With Doctor",
  completed: "Completed",
  no_show: "No Show",
  cancelled: "Cancelled",
};

export const queueStatusDotClass: Record<QueuePatientStatus, string> = {
  waiting: "bg-cyan-400",
  with_medecin: "bg-emerald-400",
  completed: "bg-teal-400",
  no_show: "bg-amber-400",
  cancelled: "bg-rose-400",
};

export const queueStatusBadgeClass: Record<QueuePatientStatus, string> = {
  waiting: "border-cyan-400/35 bg-cyan-500/12 text-cyan-700",
  with_medecin: "border-emerald-400/35 bg-emerald-500/12 text-emerald-700",
  completed: "border-teal-400/35 bg-teal-500/12 text-teal-700",
  no_show: "border-amber-400/35 bg-amber-500/12 text-amber-700",
  cancelled: "border-rose-400/35 bg-rose-500/12 text-rose-700",
};

export const queueStatusIcon: Record<QueuePatientStatus, LucideIcon> = {
  waiting: Hourglass,
  with_medecin: Stethoscope,
  completed: CheckCircle2,
  no_show: UserX,
  cancelled: XCircle,
};

/* ------------------------------------------------------------------ */
/*  Queue type constants                                               */
/* ------------------------------------------------------------------ */

export const queueTypeLabel: Record<string, string> = {
  rdv: "RDV",
  sans_rdv: "Sans-RDV",
};

export const queueTypeStripeClass: Record<string, string> = {
  rdv: "bg-gradient-to-b from-cyan-400/70 to-cyan-400/40",
  sans_rdv: "bg-gradient-to-b from-amber-400/70 to-amber-400/40",
  with_medecin: "bg-gradient-to-b from-emerald-400/70 to-emerald-400/40",
};

/* ------------------------------------------------------------------ */
/*  Column definitions                                                 */
/* ------------------------------------------------------------------ */

export interface QueueColumnDef {
  id: QueueColumnId;
  label: string;
  icon: LucideIcon;
  headerGradient: string;
  canAdd: boolean;
}

export const queueColumns: QueueColumnDef[] = [
  {
    id: "rdv",
    label: "RDV",
    icon: CalendarClock,
    headerGradient: "from-primary/60 via-primary/40 to-accent/40",
    canAdd: true,
  },
  {
    id: "sans_rdv",
    label: "Sans-RDV",
    icon: Users2,
    headerGradient: "from-amber-400/60 via-amber-400/40 to-orange-400/40",
    canAdd: true,
  },
  {
    id: "with_medecin",
    label: "Médecin",
    icon: Stethoscope,
    headerGradient: "from-emerald-400/60 via-emerald-400/40 to-teal-400/40",
    canAdd: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Wait time formatting                                               */
/* ------------------------------------------------------------------ */

export const formatWaitTime = (checkedInAt: string): string => {
  const diff = Date.now() - new Date(checkedInAt).getTime();
  const totalMinutes = Math.max(0, Math.floor(diff / 60_000));
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

export const getWaitMinutes = (checkedInAt: string): number => {
  const diff = Date.now() - new Date(checkedInAt).getTime();
  return Math.max(0, Math.floor(diff / 60_000));
};

export const getWaitSeverity = (
  checkedInAt: string,
): "critical" | "warning" | "normal" => {
  const minutes = getWaitMinutes(checkedInAt);
  if (minutes >= 4 * 60) return "critical";
  if (minutes >= 2 * 60) return "warning";
  return "normal";
};

export const getWaitTimeClass = (checkedInAt: string): string => {
  const diff = Date.now() - new Date(checkedInAt).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 15) return "border-emerald-400/35 bg-emerald-500/12 text-emerald-700";
  if (minutes < 30) return "border-amber-400/35 bg-amber-500/12 text-amber-700";
  return "border-rose-400/35 bg-rose-500/12 text-rose-700";
};

/* ------------------------------------------------------------------ */
/*  Date helpers (Africa/Casablanca timezone)                          */
/* ------------------------------------------------------------------ */

export const getTodayStr = (): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Africa/Casablanca",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
};

export const formatQueueDate = (dateStr: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Casablanca",
  }).format(new Date(dateStr + "T12:00:00"));

/* ------------------------------------------------------------------ */
/*  Stats types                                                        */
/* ------------------------------------------------------------------ */

export type QueueStats = {
  waiting: number;
  withDoctor: number;
  completed: number;
  noShow: number;
  avgWaitMinutes: number;
};

export const statCardDefs: Array<{
  key: keyof QueueStats;
  label: string;
  icon: LucideIcon;
  plateClass: string;
  format?: (v: number) => string;
}> = [
  {
    key: "waiting",
    label: "Waiting",
    icon: Hourglass,
    plateClass: "border-cyan-400/35 bg-cyan-500/12 text-cyan-600",
  },
  {
    key: "withDoctor",
    label: "With Doctor",
    icon: Stethoscope,
    plateClass: "border-emerald-400/35 bg-emerald-500/12 text-emerald-600",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    plateClass: "border-teal-400/35 bg-teal-500/12 text-teal-600",
  },
  {
    key: "avgWaitMinutes",
    label: "Avg Wait",
    icon: Clock,
    plateClass: "border-slate-400/35 bg-slate-500/12 text-slate-600",
    format: (v) => (v > 0 ? `${v}m` : "—"),
  },
];
