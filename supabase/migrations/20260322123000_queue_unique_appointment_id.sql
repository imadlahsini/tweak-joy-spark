DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'queue_patients_unique_appointment_id'
  ) THEN
    ALTER TABLE public.queue_patients
      ADD CONSTRAINT queue_patients_unique_appointment_id UNIQUE (appointment_id);
  END IF;
END;
$$;
