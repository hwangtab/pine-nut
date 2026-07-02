-- ==================== is_member(): pending 포함 활성 회원 ====================
CREATE OR REPLACE FUNCTION is_member()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_members m
    WHERE m.active
      AND (m.user_id = auth.uid()
           OR lower(m.email) = lower(auth.jwt() ->> 'email'))
  );
$$;
GRANT EXECUTE ON FUNCTION is_member() TO authenticated, anon;

-- ==================== board_posts ====================
CREATE TABLE IF NOT EXISTS board_posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_nickname TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_board_posts_created ON board_posts (created_at DESC) WHERE NOT is_deleted;
CREATE TRIGGER board_posts_updated_at BEFORE UPDATE ON board_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== board_comments ====================
CREATE TABLE IF NOT EXISTS board_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_board_comments_post ON board_comments (post_id, created_at);
CREATE TRIGGER board_comments_updated_at BEFORE UPDATE ON board_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== RLS ====================
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_comments ENABLE ROW LEVEL SECURITY;

-- 공개 읽기(삭제·숨김 제외)
CREATE POLICY "board_posts_public_read" ON board_posts
  FOR SELECT TO anon, authenticated USING (NOT is_deleted AND NOT is_hidden);
CREATE POLICY "board_comments_public_read" ON board_comments
  FOR SELECT TO anon, authenticated USING (NOT is_deleted AND NOT is_hidden);
-- 기획단 전체 열람(숨김·삭제 포함)
CREATE POLICY "board_posts_admin_read" ON board_posts
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "board_comments_admin_read" ON board_comments
  FOR SELECT TO authenticated USING (is_active_admin());
-- 회원 작성
CREATE POLICY "board_posts_member_insert" ON board_posts
  FOR INSERT TO authenticated WITH CHECK (is_member() AND author_user_id = auth.uid());
CREATE POLICY "board_comments_member_insert" ON board_comments
  FOR INSERT TO authenticated WITH CHECK (is_member() AND author_user_id = auth.uid());
-- 본인 수정/삭제(소프트)
CREATE POLICY "board_posts_owner_update" ON board_posts
  FOR UPDATE TO authenticated USING (author_user_id = auth.uid()) WITH CHECK (author_user_id = auth.uid());
CREATE POLICY "board_comments_owner_update" ON board_comments
  FOR UPDATE TO authenticated USING (author_user_id = auth.uid()) WITH CHECK (author_user_id = auth.uid());
-- 기획단 모더레이션(숨김/삭제 토글)
CREATE POLICY "board_posts_editor_update" ON board_posts
  FOR UPDATE TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());
CREATE POLICY "board_comments_editor_update" ON board_comments
  FOR UPDATE TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());

-- ==================== admin_members: 본인 행 self-read (pending 포함) ====================
CREATE POLICY "admin_members_self_read" ON admin_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR lower(email) = lower(auth.jwt() ->> 'email'));

-- ==================== 닉네임 설정: display_name만 갱신하는 SECURITY DEFINER RPC ====================
-- self-UPDATE 정책을 열면 role/active까지 위조 가능하므로, 컬럼을 함수로 제한한다.
CREATE OR REPLACE FUNCTION set_my_nickname(new_nickname text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE updated int;
BEGIN
  UPDATE admin_members
    SET display_name = new_nickname
    WHERE active AND (user_id = auth.uid() OR lower(email) = lower(auth.jwt() ->> 'email'));
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated > 0;
END;
$$;
GRANT EXECUTE ON FUNCTION set_my_nickname(text) TO authenticated;

-- ==================== 모더레이션 우회 방지: 비-기획단은 is_hidden 변경 불가 ====================
CREATE OR REPLACE FUNCTION board_guard_is_hidden()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_hidden IS DISTINCT FROM OLD.is_hidden AND NOT admin_can_edit() THEN
    NEW.is_hidden := OLD.is_hidden;  -- 작성자 본인이라도 숨김 상태는 되돌릴 수 없음
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER board_posts_guard_hidden BEFORE UPDATE ON board_posts
  FOR EACH ROW EXECUTE FUNCTION board_guard_is_hidden();
CREATE TRIGGER board_comments_guard_hidden BEFORE UPDATE ON board_comments
  FOR EACH ROW EXECUTE FUNCTION board_guard_is_hidden();
