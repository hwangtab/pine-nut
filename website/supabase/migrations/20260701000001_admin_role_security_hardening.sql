-- Admin role hardening after introducing role-based access.
-- 1) Signature emails must be readable only by active admins, not every authenticated user.
-- 2) Write-only operational surfaces stay editor+, not read-only viewer.
-- 3) Admin member emails are canonical lower-case identifiers across SQL and app code.

DROP POLICY IF EXISTS "Authenticated read signatures" ON public.signatures;
DROP POLICY IF EXISTS "signatures_admin_read" ON public.signatures;

CREATE POLICY "signatures_admin_read" ON public.signatures
  FOR SELECT TO authenticated
  USING (is_active_admin());

DROP POLICY IF EXISTS "Authenticated insert audit" ON public.audit_log;
DROP POLICY IF EXISTS "audit_admin_insert" ON public.audit_log;
DROP POLICY IF EXISTS "audit_editor_insert" ON public.audit_log;

CREATE POLICY "audit_editor_insert" ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (admin_can_edit());

DROP POLICY IF EXISTS "images_editor_delete" ON storage.objects;

CREATE POLICY "images_editor_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'images' AND admin_can_edit());

DELETE FROM public.admin_members
WHERE btrim(email) = '';

WITH ranked_admin_members AS (
  SELECT
    id,
    lower(btrim(email)) AS normalized_email,
    row_number() OVER (
      PARTITION BY lower(btrim(email))
      ORDER BY
        active DESC,
        CASE role WHEN 'owner' THEN 3 WHEN 'editor' THEN 2 ELSE 1 END DESC,
        (user_id IS NOT NULL) DESC,
        id ASC
    ) AS row_number
  FROM public.admin_members
)
DELETE FROM public.admin_members member
USING ranked_admin_members ranked
WHERE member.id = ranked.id
  AND ranked.row_number > 1;

UPDATE public.admin_members
SET email = lower(btrim(email))
WHERE email <> lower(btrim(email));

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_members_email_normalized_unique
ON public.admin_members ((lower(btrim(email))));

ALTER TABLE public.admin_members
  DROP CONSTRAINT IF EXISTS admin_members_email_lowercase;

ALTER TABLE public.admin_members
  ADD CONSTRAINT admin_members_email_lowercase
  CHECK (email = lower(btrim(email)) AND email <> '');
