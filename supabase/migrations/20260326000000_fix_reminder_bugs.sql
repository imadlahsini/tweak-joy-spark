-- Fix notification bugs: prevent duplicates & harden reminder dispatch
-- BUG 1: Reminders dispatched for cancelled/completed appointments
-- BUG 2: Duplicate send on stale-processing recovery (10min → 2min)
-- BUG 4: Duplicate appointments for same phone+date+time
-- BUG 5: No max retry limit

-- 1. Prevent duplicate bookings for same phone + date + time
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_unique_booking
  UNIQUE (normalized_client_phone, appointment_date, appointment_time);

-- 2. Hardened claim RPC with:
--    - appointment status check (skip cancelled/completed/no_show)
--    - max attempts cap (5)
--    - shorter stale-processing recovery (2 min instead of 10)
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
    JOIN public.appointments a ON a.id = r.appointment_id
    WHERE (
            r.status = 'pending'
            OR (r.status = 'processing' AND r.updated_at <= now() - INTERVAL '2 minutes')
          )
      AND r.scheduled_for <= now()
      AND r.attempts < 5
      AND a.status NOT IN ('completed', 'cancelled', 'no_show')
    ORDER BY r.scheduled_for ASC
    LIMIT GREATEST(batch_size, 1)
    FOR UPDATE OF r SKIP LOCKED
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
