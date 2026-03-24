export type QueueType = "rdv" | "sans_rdv";
export type QueuePatientStatus = "waiting" | "with_medecin" | "completed" | "no_show" | "cancelled";
export type QueueColumnId = "rdv" | "sans_rdv" | "with_medecin";

export interface PatientProfile {
  id: string;
  name: string;
  phone: string;
  normalizedPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Optician {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  mapLink: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface QueuePatient {
  id: string;
  queueDate: string;
  queueType: QueueType;
  clientName: string;
  clientPhone: string | null;
  status: QueuePatientStatus;
  notes: string | null;
  procedure: string | null;
  procedureAt: string | null;
  followUp: string | null;
  followUpDate: string | null;
  followUpQueuePatientId: string | null;
  patientProfileId: string | null;
  opticianId: string | null;
  optician: Optician | null;
  position: number;
  checkedInAt: string;
  withDoctorAt: string | null;
  completedAt: string | null;
  noShowAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const PROCEDURES = [
  "Dilatation Viapen",
  "Dilatation Mydria",
  "Contrôle HTO",
  "Eidon",
  "Eidon + Dilatation",
  "Préparation",
] as const;

export const FOLLOW_UPS = [
  "15 Days",
  "1 month",
  "2 months",
  "3 months",
  "6 months",
  "1 year",
] as const;
