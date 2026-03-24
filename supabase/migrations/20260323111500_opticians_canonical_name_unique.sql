DO $$
DECLARE
  duplicate_names text;
BEGIN
  SELECT string_agg(
           format('%s (%s rows)', canonical_name, duplicate_count),
           ', '
           ORDER BY canonical_name
         )
    INTO duplicate_names
  FROM (
    SELECT
      lower(regexp_replace(btrim(name), '\s+', ' ', 'g')) AS canonical_name,
      count(*) AS duplicate_count
    FROM public.opticians
    GROUP BY 1
    HAVING count(*) > 1
  ) duplicates;

  IF duplicate_names IS NOT NULL THEN
    RAISE EXCEPTION USING
      MESSAGE = 'Cannot enforce unique optician names until canonical duplicates are resolved.',
      DETAIL = duplicate_names,
      HINT = 'Rename or merge the listed opticians so each trimmed, lowercased name with collapsed internal spaces is unique.';
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS opticians_name_canonical_unique_idx
  ON public.opticians ((lower(regexp_replace(btrim(name), '\s+', ' ', 'g'))));
