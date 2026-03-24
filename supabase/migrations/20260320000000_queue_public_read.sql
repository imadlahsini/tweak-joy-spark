-- Allow anonymous (unauthenticated) browsers to read today's queue.
-- Used by the TV waiting-room display page (/queue-display).
-- Scoped to today's date only to minimise data exposure.

CREATE POLICY "queue_patients_anon_today_read" ON queue_patients
  FOR SELECT TO anon
  USING (
    queue_date = (CURRENT_DATE AT TIME ZONE 'Africa/Casablanca')::date
  );

-- Allow anonymous browsers to read optician names for the display.
CREATE POLICY "opticians_anon_read" ON opticians
  FOR SELECT TO anon
  USING (true);
