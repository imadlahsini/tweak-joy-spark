ALTER TABLE public.queue_patients
  ADD COLUMN IF NOT EXISTS follow_up_date date,
  ADD COLUMN IF NOT EXISTS follow_up_queue_patient_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'queue_patients_follow_up_queue_patient_id_fkey'
  ) THEN
    ALTER TABLE public.queue_patients
      ADD CONSTRAINT queue_patients_follow_up_queue_patient_id_fkey
      FOREIGN KEY (follow_up_queue_patient_id)
      REFERENCES public.queue_patients(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS queue_patients_follow_up_queue_patient_id_idx
  ON public.queue_patients(follow_up_queue_patient_id);

CREATE UNIQUE INDEX IF NOT EXISTS queue_patients_unique_follow_up_queue_patient_id
  ON public.queue_patients(follow_up_queue_patient_id)
  WHERE follow_up_queue_patient_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_queue_patient_follow_up_atomic(
  _source_queue_patient_id uuid,
  _follow_up text,
  _follow_up_date date
)
RETURNS public.queue_patients
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _source_row public.queue_patients;
  _linked_row public.queue_patients;
  _target_row public.queue_patients;
  _result_row public.queue_patients;
  _profile public.patient_profiles;
  _today date;
  _next_position integer;
  _can_reuse_linked boolean := false;
BEGIN
  IF _follow_up NOT IN ('15 Days', '1 month', '2 months', '3 months', '6 months', '1 year') THEN
    RAISE EXCEPTION 'invalid_follow_up';
  END IF;

  _today := timezone('Africa/Casablanca', now())::date;

  IF _follow_up_date IS NULL OR _follow_up_date < _today THEN
    RAISE EXCEPTION 'invalid_follow_up_date';
  END IF;

  SELECT *
    INTO _source_row
  FROM public.queue_patients
  WHERE id = _source_queue_patient_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'queue_patient_not_found';
  END IF;

  IF _source_row.status <> 'with_medecin' THEN
    RAISE EXCEPTION 'invalid_source_status';
  END IF;

  IF _source_row.patient_profile_id IS NULL
     AND public.normalize_moroccan_phone(_source_row.client_phone) IS NOT NULL THEN
    SELECT *
      INTO _profile
    FROM public.upsert_patient_profile_for_queue(
      _source_row.client_name,
      _source_row.client_phone
    );

    UPDATE public.queue_patients
    SET patient_profile_id = _profile.id
    WHERE id = _source_queue_patient_id
    RETURNING * INTO _source_row;
  END IF;

  IF _source_row.follow_up_queue_patient_id IS NOT NULL THEN
    SELECT *
      INTO _linked_row
    FROM public.queue_patients
    WHERE id = _source_row.follow_up_queue_patient_id
    FOR UPDATE;

    IF FOUND AND _linked_row.status = 'waiting' AND _linked_row.queue_type = 'rdv' THEN
      _can_reuse_linked := true;
    END IF;
  END IF;

  IF _can_reuse_linked AND _linked_row.queue_date = _follow_up_date THEN
    UPDATE public.queue_patients
    SET
      client_name = _source_row.client_name,
      client_phone = _source_row.client_phone,
      patient_profile_id = _source_row.patient_profile_id,
      notes = NULL,
      procedure = NULL,
      procedure_at = NULL,
      follow_up = NULL,
      follow_up_date = NULL,
      follow_up_queue_patient_id = NULL,
      optician_id = NULL,
      appointment_id = NULL
    WHERE id = _linked_row.id
    RETURNING * INTO _target_row;
  ELSE
    PERFORM pg_advisory_xact_lock(hashtextextended(_follow_up_date::text || ':rdv:waiting', 0));

    SELECT COALESCE(MAX(position), -1) + 1
      INTO _next_position
    FROM public.queue_patients
    WHERE queue_date = _follow_up_date
      AND queue_type = 'rdv'
      AND status = 'waiting';

    IF _can_reuse_linked THEN
      UPDATE public.queue_patients
      SET
        queue_date = _follow_up_date,
        queue_type = 'rdv',
        client_name = _source_row.client_name,
        client_phone = _source_row.client_phone,
        patient_profile_id = _source_row.patient_profile_id,
        notes = NULL,
        status = 'waiting',
        position = _next_position,
        procedure = NULL,
        procedure_at = NULL,
        follow_up = NULL,
        follow_up_date = NULL,
        follow_up_queue_patient_id = NULL,
        optician_id = NULL,
        with_doctor_at = NULL,
        completed_at = NULL,
        no_show_at = NULL,
        cancelled_at = NULL,
        appointment_id = NULL
      WHERE id = _linked_row.id
      RETURNING * INTO _target_row;
    ELSE
      INSERT INTO public.queue_patients (
        queue_date,
        queue_type,
        client_name,
        client_phone,
        patient_profile_id,
        notes,
        status,
        position,
        procedure,
        procedure_at,
        follow_up,
        follow_up_date,
        follow_up_queue_patient_id,
        optician_id,
        appointment_id
      )
      VALUES (
        _follow_up_date,
        'rdv',
        _source_row.client_name,
        _source_row.client_phone,
        _source_row.patient_profile_id,
        NULL,
        'waiting',
        _next_position,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
      )
      RETURNING * INTO _target_row;
    END IF;
  END IF;

  UPDATE public.queue_patients
  SET
    follow_up = _follow_up,
    follow_up_date = _follow_up_date,
    follow_up_queue_patient_id = _target_row.id
  WHERE id = _source_queue_patient_id
  RETURNING * INTO _result_row;

  RETURN _result_row;
END;
$$;
