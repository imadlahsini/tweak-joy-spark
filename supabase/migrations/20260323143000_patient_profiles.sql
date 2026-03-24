CREATE OR REPLACE FUNCTION public.normalize_moroccan_phone(value text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  digits_only text;
  normalized text;
BEGIN
  IF value IS NULL THEN
    RETURN NULL;
  END IF;

  digits_only := regexp_replace(value, '\D', '', 'g');
  IF digits_only = '' THEN
    RETURN NULL;
  END IF;

  normalized := digits_only;

  IF normalized LIKE '00212%' THEN
    normalized := substr(normalized, 6);
  ELSIF normalized LIKE '212%' THEN
    normalized := substr(normalized, 4);
  END IF;

  IF substr(normalized, 1, 1) IN ('6', '7') AND length(normalized) <= 9 THEN
    normalized := '0' || normalized;
  END IF;

  IF normalized LIKE '00%' AND substr(normalized, 3, 1) IN ('6', '7') THEN
    normalized := substr(normalized, 2);
  END IF;

  normalized := substr(normalized, 1, 10);

  IF normalized ~ '^0[67][0-9]{8}$' THEN
    RETURN normalized;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  normalized_phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT patient_profiles_normalized_phone_format
    CHECK (normalized_phone ~ '^0[67][0-9]{8}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS patient_profiles_normalized_phone_key
  ON public.patient_profiles(normalized_phone);

ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'patient_profiles'
      AND policyname = 'Authenticated users can view patient profiles'
  ) THEN
    CREATE POLICY "Authenticated users can view patient profiles"
      ON public.patient_profiles FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'patient_profiles'
      AND policyname = 'Authenticated users can insert patient profiles'
  ) THEN
    CREATE POLICY "Authenticated users can insert patient profiles"
      ON public.patient_profiles FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'patient_profiles'
      AND policyname = 'Authenticated users can update patient profiles'
  ) THEN
    CREATE POLICY "Authenticated users can update patient profiles"
      ON public.patient_profiles FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'patient_profiles'
      AND policyname = 'Authenticated users can delete patient profiles'
  ) THEN
    CREATE POLICY "Authenticated users can delete patient profiles"
      ON public.patient_profiles FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.update_patient_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_patient_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trg_patient_profiles_updated_at
      BEFORE UPDATE ON public.patient_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.update_patient_profiles_updated_at();
  END IF;
END
$$;

ALTER TABLE public.queue_patients
  ADD COLUMN IF NOT EXISTS patient_profile_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'queue_patients_patient_profile_id_fkey'
  ) THEN
    ALTER TABLE public.queue_patients
      ADD CONSTRAINT queue_patients_patient_profile_id_fkey
      FOREIGN KEY (patient_profile_id)
      REFERENCES public.patient_profiles(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS queue_patients_patient_profile_id_idx
  ON public.queue_patients(patient_profile_id);

INSERT INTO public.patient_profiles (name, phone, normalized_phone, created_at, updated_at)
SELECT DISTINCT ON (normalized_phone)
  client_name,
  btrim(client_phone),
  normalized_phone,
  created_at,
  updated_at
FROM (
  SELECT
    qp.client_name,
    qp.client_phone,
    public.normalize_moroccan_phone(qp.client_phone) AS normalized_phone,
    qp.created_at,
    qp.updated_at
  FROM public.queue_patients qp
  WHERE qp.client_phone IS NOT NULL
) seeded_profiles
WHERE normalized_phone IS NOT NULL
ORDER BY normalized_phone, updated_at DESC, created_at DESC
ON CONFLICT (normalized_phone) DO UPDATE
SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  updated_at = GREATEST(public.patient_profiles.updated_at, EXCLUDED.updated_at);

UPDATE public.queue_patients qp
SET patient_profile_id = pp.id
FROM public.patient_profiles pp
WHERE qp.patient_profile_id IS NULL
  AND pp.normalized_phone = public.normalize_moroccan_phone(qp.client_phone);

CREATE OR REPLACE FUNCTION public.upsert_patient_profile_for_queue(
  _name text,
  _phone text
)
RETURNS public.patient_profiles
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _normalized_phone text;
  _profile public.patient_profiles;
BEGIN
  _normalized_phone := public.normalize_moroccan_phone(_phone);

  IF _normalized_phone IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.patient_profiles (
    name,
    phone,
    normalized_phone
  )
  VALUES (
    btrim(_name),
    btrim(_phone),
    _normalized_phone
  )
  ON CONFLICT (normalized_phone) DO UPDATE
  SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    updated_at = now()
  RETURNING * INTO _profile;

  RETURN _profile;
END;
$$;

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
  _profile public.patient_profiles;
BEGIN
  IF _queue_type NOT IN ('rdv', 'sans_rdv') THEN
    RAISE EXCEPTION 'invalid_queue_type';
  END IF;

  IF public.normalize_moroccan_phone(_client_phone) IS NOT NULL THEN
    SELECT *
      INTO _profile
    FROM public.upsert_patient_profile_for_queue(_client_name, _client_phone);
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
    patient_profile_id,
    notes,
    status,
    position
  )
  VALUES (
    _queue_date,
    _queue_type,
    _client_name,
    NULLIF(BTRIM(_client_phone), ''),
    _profile.id,
    NULLIF(BTRIM(_notes), ''),
    'waiting',
    _next_position
  )
  RETURNING * INTO _new_row;

  RETURN _new_row;
END;
$$;
