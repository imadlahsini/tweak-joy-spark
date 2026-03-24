import { supabase } from "@/integrations/supabase/client";
import {
  isValidMoroccanPhone,
  normalizeMoroccanPhone,
} from "@/lib/moroccan-phone";
import type { PatientProfile } from "@/types/queue";

interface PatientProfileRow {
  id: string;
  name: string;
  phone: string;
  normalized_phone: string;
  created_at: string;
  updated_at: string;
}

export const mapPatientProfileRow = (row: PatientProfileRow): PatientProfile => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  normalizedPhone: row.normalized_phone,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const findPatientProfileByPhone = async (
  phone: string,
): Promise<PatientProfile | null> => {
  const normalizedPhone = normalizeMoroccanPhone(phone);
  if (isValidMoroccanPhone(normalizedPhone) === false) {
    return null;
  }

  const { data, error } = await supabase
    .from("patient_profiles")
    .select("id, name, phone, normalized_phone, created_at, updated_at")
    .eq("normalized_phone", normalizedPhone)
    .maybeSingle();

  if (error) throw error;
  if (data == null) return null;

  return mapPatientProfileRow(data);
};
