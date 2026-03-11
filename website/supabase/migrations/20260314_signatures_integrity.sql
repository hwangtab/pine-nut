ALTER TABLE signatures
ADD COLUMN IF NOT EXISTS ip_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_signatures_ip_hash_created_at
ON signatures (ip_hash, created_at DESC);

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY lower(btrim(email))
      ORDER BY created_at ASC, id ASC
    ) AS row_num
  FROM signatures
)
DELETE FROM signatures s
USING ranked r
WHERE s.id = r.id
  AND r.row_num > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_signatures_unique_normalized_email
ON signatures ((lower(btrim(email))));

DROP POLICY IF EXISTS "Allow anonymous inserts" ON signatures;

CREATE POLICY "Allow anonymous inserts" ON signatures
  FOR INSERT TO anon
  WITH CHECK (ip_hash IS NOT NULL AND length(ip_hash) > 0);

CREATE OR REPLACE FUNCTION enforce_signatures_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.ip_hash IS NULL OR length(NEW.ip_hash) = 0 THEN
    RAISE EXCEPTION 'ip_hash_required';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(NEW.ip_hash));

  IF (
    SELECT COUNT(*)
    FROM signatures
    WHERE ip_hash = NEW.ip_hash
      AND created_at >= (now() - interval '1 minute')
  ) >= 5 THEN
    RAISE EXCEPTION 'rate_limit_exceeded';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS signatures_rate_limit_trigger ON signatures;

CREATE TRIGGER signatures_rate_limit_trigger
  BEFORE INSERT ON signatures
  FOR EACH ROW
  EXECUTE FUNCTION enforce_signatures_rate_limit();
