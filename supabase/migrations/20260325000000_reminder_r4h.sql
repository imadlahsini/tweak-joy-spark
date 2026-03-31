-- Migrate reminder types: r3h → r4h, remove r30m
-- Schedule changes from (24h, 3h, 30m) to (24h, 4h)

-- 1. Convert existing r3h reminders to r4h
UPDATE appointment_reminders SET reminder_type = 'r4h' WHERE reminder_type = 'r3h';

-- 2. Remove r30m reminders (no longer used)
DELETE FROM appointment_reminders WHERE reminder_type = 'r30m';

-- 3. Update the CHECK constraint
ALTER TABLE appointment_reminders DROP CONSTRAINT IF EXISTS appointment_reminders_reminder_type_check;
ALTER TABLE appointment_reminders ADD CONSTRAINT appointment_reminders_reminder_type_check
  CHECK (reminder_type IN ('r24h', 'r4h'));
