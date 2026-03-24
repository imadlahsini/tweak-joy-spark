CREATE OR REPLACE FUNCTION public.move_queue_patient_to_medecin_atomic(
  _patient_id uuid
)
RETURNS public.queue_patients
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _source_row public.queue_patients;
  _updated_row public.queue_patients;
  _next_position integer;
BEGIN
  SELECT *
    INTO _source_row
  FROM public.queue_patients
  WHERE id = _patient_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'queue_patient_not_found';
  END IF;

  IF _source_row.status <> 'waiting' THEN
    RAISE EXCEPTION 'invalid_source_status';
  END IF;

  IF _source_row.queue_type NOT IN ('rdv', 'sans_rdv') THEN
    RAISE EXCEPTION 'invalid_source_queue_type';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(_source_row.queue_date::text || ':with_medecin', 0));

  SELECT COALESCE(MAX(position), -1) + 1
    INTO _next_position
  FROM public.queue_patients
  WHERE queue_date = _source_row.queue_date
    AND status = 'with_medecin';

  UPDATE public.queue_patients
  SET
    status = 'with_medecin',
    with_doctor_at = COALESCE(with_doctor_at, NOW()),
    position = _next_position
  WHERE id = _patient_id
  RETURNING * INTO _updated_row;

  RETURN _updated_row;
END;
$$;
