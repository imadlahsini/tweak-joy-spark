-- Link queue_patients entries back to their source online appointment.
-- Nullable — manually added walk-in patients have no appointment.
ALTER TABLE queue_patients
  ADD COLUMN IF NOT EXISTS appointment_id UUID
    REFERENCES appointments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS queue_patients_appointment_id_idx
  ON queue_patients(appointment_id);
