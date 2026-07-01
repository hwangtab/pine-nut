-- role에 'pending' 추가(가입 직후 무권한 대기 상태), 기본값 pending
ALTER TABLE public.admin_members DROP CONSTRAINT IF EXISTS admin_members_role_check;
ALTER TABLE public.admin_members
  ADD CONSTRAINT admin_members_role_check CHECK (role IN ('owner','editor','viewer','pending'));
ALTER TABLE public.admin_members ALTER COLUMN role SET DEFAULT 'pending';

-- is_active_admin: pending은 관리자 아님(실제 3역할만 관리자)
CREATE OR REPLACE FUNCTION is_active_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_members m
    WHERE m.active
      AND m.role IN ('owner','editor','viewer')
      AND (m.user_id = auth.uid()
           OR lower(m.email) = lower(auth.jwt() ->> 'email'))
  );
$$;
