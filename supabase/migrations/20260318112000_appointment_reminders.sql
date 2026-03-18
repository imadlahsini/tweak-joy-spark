-- Appointment + reminder queue model for WhatsApp reminder automation

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  normalized_client_phone TEXT NOT NULL,
  whatsapp_chat_id TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'fr', 'ar', 'zgh')),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('r24h', 'r3h', 'r30m')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'skipped')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT appointment_reminders_unique_type UNIQUE (appointment_id, reminder_type)
);

ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read appointment_reminders"
ON public.appointment_reminders
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_appointment_reminders_status_schedule
  ON public.appointment_reminders(status, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_appointment_reminders_appointment
  ON public.appointment_reminders(appointment_id);

CREATE OR REPLACE FUNCTION public.claim_due_appointment_reminders(batch_size INTEGER DEFAULT 25)
RETURNS TABLE (
  reminder_id UUID,
  appointment_id UUID,
  reminder_type TEXT,
  scheduled_for TIMESTAMPTZ,
  attempts INTEGER,
  language TEXT,
  client_name TEXT,
  whatsapp_chat_id TEXT,
  appointment_at TIMESTAMPTZ,
  appointment_time TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH candidate AS (
    SELECT r.id
    FROM public.appointment_reminders r
    WHERE (r.status = 'pending' OR (r.status = 'processing' AND r.updated_at <= now() - INTERVAL '10 minutes'))
      AND r.scheduled_for <= now()
    ORDER BY r.scheduled_for ASC
    LIMIT GREATEST(batch_size, 1)
    FOR UPDATE SKIP LOCKED
  ),
  updated AS (
    UPDATE public.appointment_reminders r
    SET status = 'processing',
        updated_at = now()
    FROM candidate c
    WHERE r.id = c.id
    RETURNING r.id, r.appointment_id, r.reminder_type, r.scheduled_for, r.attempts
  )
  SELECT
    u.id AS reminder_id,
    u.appointment_id,
    u.reminder_type,
    u.scheduled_for,
    u.attempts,
    a.language,
    a.client_name,
    a.whatsapp_chat_id,
    a.appointment_at,
    to_char(a.appointment_time, 'HH24:MI') AS appointment_time
  FROM updated u
  JOIN public.appointments a ON a.id = u.appointment_id;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.dispatch_appointment_reminders_cron()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_url TEXT;
  anon_key TEXT;
  dispatch_secret TEXT;
  request_headers JSONB;
BEGIN
  SELECT decrypted_secret
  INTO project_url
  FROM vault.decrypted_secrets
  WHERE name = 'project_url'
  ORDER BY created_at DESC
  LIMIT 1;

  SELECT decrypted_secret
  INTO anon_key
  FROM vault.decrypted_secrets
  WHERE name = 'anon_key'
  ORDER BY created_at DESC
  LIMIT 1;

  SELECT decrypted_secret
  INTO dispatch_secret
  FROM vault.decrypted_secrets
  WHERE name = 'reminder_dispatch_secret'
  ORDER BY created_at DESC
  LIMIT 1;

  IF project_url IS NULL OR dispatch_secret IS NULL THEN
    RAISE NOTICE 'Skipping reminder dispatcher cron: missing vault secret(s) project_url or reminder_dispatch_secret';
    RETURN;
  END IF;

  IF anon_key IS NULL THEN
    request_headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-reminder-dispatch-secret', dispatch_secret
    );
  ELSE
    request_headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', anon_key,
      'Authorization', 'Bearer ' || anon_key,
      'x-reminder-dispatch-secret', dispatch_secret
    );
  END IF;

  PERFORM net.http_post(
    url := rtrim(project_url, '/') || '/functions/v1/dispatch-appointment-reminders',
    headers := request_headers,
    body := '{"source":"pg_cron"}'::jsonb
  );
END;
$$;

DO $$
DECLARE
  existing_job_id BIGINT;
BEGIN
  SELECT jobid
  INTO existing_job_id
  FROM cron.job
  WHERE jobname = 'dispatch-appointment-reminders-every-minute'
  LIMIT 1;

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;

  PERFORM cron.schedule(
    'dispatch-appointment-reminders-every-minute',
    '* * * * *',
    $cron$SELECT public.dispatch_appointment_reminders_cron();$cron$
  );
END;
$$;
