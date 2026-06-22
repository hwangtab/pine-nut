-- Lock down petition signatures so public users can only go through
-- the Next.js API, while authenticated admins can still review emails.

DROP POLICY IF EXISTS "Allow anonymous select" ON public.signatures;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.signatures;
DROP POLICY IF EXISTS "Authenticated read signatures" ON public.signatures;
DROP POLICY IF EXISTS "Service role read signatures" ON public.signatures;
DROP POLICY IF EXISTS "Service role insert signatures" ON public.signatures;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.signatures FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.signatures FROM authenticated;

GRANT SELECT ON TABLE public.signatures TO authenticated;
GRANT SELECT, INSERT ON TABLE public.signatures TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.signatures_id_seq TO service_role;

CREATE POLICY "Authenticated read signatures" ON public.signatures
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service role read signatures" ON public.signatures
  FOR SELECT TO service_role
  USING (true);

CREATE POLICY "Service role insert signatures" ON public.signatures
  FOR INSERT TO service_role
  WITH CHECK (
    ip_hash IS NOT NULL
    AND length(ip_hash) > 0
    AND consent_privacy IS TRUE
    AND consent_age IS TRUE
  );
