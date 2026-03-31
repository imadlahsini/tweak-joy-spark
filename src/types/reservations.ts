export type ReservationStatus = "new" | "confirmed" | "completed" | "cancelled" | "no_show";
export type ReminderType = "r24h" | "r4h";
export type ReminderStatus = "pending" | "processing" | "sent" | "failed" | "skipped";
export type DeliveryStatus = "unknown" | "sent" | "failed" | "skipped";

export interface ReminderState {
  status: ReminderStatus;
  attempts: number;
  scheduledFor: string | null;
  sentAt: string | null;
  lastError: string | null;
  updatedAt: string | null;
}

export interface ReservationRow {
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
  reminders: Record<ReminderType, ReminderState>;
  createdAt: string;
  updatedAt: string;
}
