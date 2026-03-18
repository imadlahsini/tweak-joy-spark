ALTER TABLE IF EXISTS public.appointments
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'confirmed', 'completed', 'cancelled', 'no_show')),
  ADD COLUMN IF NOT EXISTS confirmation_whatsapp_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (confirmation_whatsapp_status IN ('unknown', 'sent', 'failed', 'skipped')),
  ADD COLUMN IF NOT EXISTS confirmation_whatsapp_attempts INTEGER NOT NULL DEFAULT 0
    CHECK (confirmation_whatsapp_attempts >= 0),
  ADD COLUMN IF NOT EXISTS confirmation_whatsapp_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmation_whatsapp_error TEXT;

CREATE INDEX IF NOT EXISTS idx_appointments_status_appointment_at
  ON public.appointments (status, appointment_at);

CREATE INDEX IF NOT EXISTS idx_appointments_appointment_at
  ON public.appointments (appointment_at);
