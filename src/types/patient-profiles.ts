import type { PatientProfile } from "@/types/queue";
import type {
  DeliveryStatus,
  ReminderState,
  ReservationStatus,
} from "@/types/reservations";
import type { QueuePatientStatus, QueueType } from "@/types/queue";

export interface PatientProfileDirectoryItem extends PatientProfile {
  queueVisitCount: number;
  appointmentCount: number;
  lastActivityAt: string | null;
}

export interface PatientProfileQueueHistoryRow {
  id: string;
  queueDate: string;
  queueType: QueueType;
  status: QueuePatientStatus;
  procedure: string | null;
  followUp: string | null;
  followUpDate: string | null;
  opticianName: string | null;
  notes: string | null;
  clientPhone: string | null;
  checkedInAt: string;
  withDoctorAt: string | null;
  completedAt: string | null;
  noShowAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  appointmentId: string | null;
  isLegacyPhoneMatch: boolean;
}

export interface PatientProfileAppointmentHistoryRow {
  id: string;
  clientName: string;
  clientPhone: string;
  language: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentAt: string;
  status: ReservationStatus;
  confirmation: {
    status: DeliveryStatus;
    attempts: number;
    sentAt: string | null;
    error: string | null;
  };
  reminders: Record<"r24h" | "r4h", ReminderState>;
  createdAt: string;
  updatedAt: string;
}

export type PatientProfileActivityBadgeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

export interface PatientProfileActivityBadge {
  label: string;
  tone: PatientProfileActivityBadgeTone;
}

export interface PatientProfileActivityItem {
  id: string;
  kind: "queue" | "appointment";
  occurredAt: string;
  title: string;
  subtitle: string;
  meta: string[];
  note: string | null;
  badges: PatientProfileActivityBadge[];
}

export interface PatientProfileDetailPayload {
  profile: PatientProfile;
  queueHistory: PatientProfileQueueHistoryRow[];
  upcomingAppointments: PatientProfileAppointmentHistoryRow[];
  pastAppointments: PatientProfileAppointmentHistoryRow[];
  upcomingActivity: PatientProfileActivityItem[];
  recentActivity: PatientProfileActivityItem[];
}
