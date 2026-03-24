CREATE OR REPLACE FUNCTION public.update_reservation_status_atomic(
  _reservation_id uuid,
  _status text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _now timestamptz := NOW();
  _skipped_count integer := 0;
BEGIN
  IF _status NOT IN ('new', 'confirmed', 'completed', 'cancelled', 'no_show') THEN
    RAISE EXCEPTION 'invalid_status';
  END IF;

  UPDATE public.appointments
  SET
    status = _status,
    updated_at = _now
  WHERE id = _reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reservation_not_found';
  END IF;

  IF _status IN ('completed', 'cancelled', 'no_show') THEN
    UPDATE public.appointment_reminders
    SET
      status = 'skipped',
      last_error = 'cancelled_by_status_change',
      updated_at = _now
    WHERE appointment_id = _reservation_id
      AND status IN ('pending', 'processing');

    GET DIAGNOSTICS _skipped_count = ROW_COUNT;
  END IF;

  RETURN _skipped_count;
END;
$$;
