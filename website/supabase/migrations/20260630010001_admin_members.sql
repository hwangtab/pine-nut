-- ==================== ADMIN MEMBERS (관리자 명부) ====================
CREATE TABLE IF NOT EXISTS admin_members (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_members_user_id ON admin_members (user_id);

CREATE TRIGGER admin_members_updated_at
  BEFORE UPDATE ON admin_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== 판정 함수 (SECURITY DEFINER) ====================
-- SECURITY DEFINER로 admin_members를 읽어 RLS 재귀를 회피한다.
CREATE OR REPLACE FUNCTION is_active_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_members m
    WHERE m.active
      AND (m.user_id = auth.uid()
           OR lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  );
$$;

CREATE OR REPLACE FUNCTION admin_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.role FROM admin_members m
  WHERE m.active
    AND (m.user_id = auth.uid()
         OR lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  ORDER BY CASE m.role WHEN 'owner' THEN 3 WHEN 'editor' THEN 2 ELSE 1 END DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION admin_can_edit()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT admin_role() IN ('owner', 'editor');
$$;

CREATE OR REPLACE FUNCTION is_admin_owner()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT admin_role() = 'owner';
$$;

GRANT EXECUTE ON FUNCTION is_active_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION admin_role() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION admin_can_edit() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin_owner() TO authenticated, anon;

-- ==================== admin_members RLS ====================
ALTER TABLE admin_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_members_select" ON admin_members
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "admin_members_owner_insert" ON admin_members
  FOR INSERT TO authenticated WITH CHECK (is_admin_owner());
CREATE POLICY "admin_members_owner_update" ON admin_members
  FOR UPDATE TO authenticated USING (is_admin_owner()) WITH CHECK (is_admin_owner());
CREATE POLICY "admin_members_owner_delete" ON admin_members
  FOR DELETE TO authenticated USING (is_admin_owner());

-- ==================== 부트스트랩: 기존 auth.users 전원을 owner로 ====================
-- 현재 "로그인=전권 관리자"이므로 기존 계정을 owner로 승격해 정책 전환 시 잠김 방지.
INSERT INTO admin_members (user_id, email, role, active, created_by)
SELECT id, email, 'owner', true, 'bootstrap'
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (email) DO NOTHING;
