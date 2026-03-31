-- Add sent_message_id to prevent duplicate WhatsApp sends on stale-processing recovery
ALTER TABLE public.appointment_reminders
  ADD COLUMN IF NOT EXISTS sent_message_id TEXT;
