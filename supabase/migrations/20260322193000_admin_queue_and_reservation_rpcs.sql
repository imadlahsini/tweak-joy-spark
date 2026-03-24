CREATE OR REPLACE FUNCTION public.add_queue_patient_atomic(
  _queue_date date,
  _queue_type text,
  _client_name text,
  _client_phone text DEFAULT NULL,
  _notes text DEFAULT NULL
)
RETURNS public.queue_patients
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _next_position integer;
  _new_row public.queue_patients;
BEGIN
  IF _queue_type NOT IN ('rdv', 'sans_rdv') THEN
    RAISE EXCEPTION 'invalid_queue_type';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(_queue_date::text || ':' || _queue_type || ':waiting', 0));

  SELECT COALESCE(MAX(position), -1) + 1
    INTO _next_position
  FROM public.queue_patients
  WHERE queue_date = _queue_date
    AND queue_type = _queue_type
    AND status = 'waiting';

  INSERT INTO public.queue_patients (
    queue_date,
    queue_type,
    client_name,
    client_phone,
    notes,
    status,
    position
  )
  VALUES (
    _queue_date,
    _queue_type,
    _client_name,
    NULLIF(BTRIM(_client_phone), ''),
    NULLIF(BTRIM(_notes), ''),
    'waiting',
    _next_position
  )
  RETURNING * INTO _new_row;

  RETURN _new_row;
END;
$$;
