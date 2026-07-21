-- ============================================================================
-- 적대적 감사 4라운드 후속 (2026-07-21)
--   1) news/timeline 공개 조회 RLS 구멍 — 로그인한 비관리자(pending 회원)가
--      /news·/timeline을 열면 anon 정책도 admin 정책도 통과 못해 빈 화면이 됐다.
--   2) board_reports status 위조 — 신고자가 REST로 status='resolved'를 직접 넣어
--      자기 신고를 검토큐에서 이탈시킬 수 있었다(컬럼 GRANT 미적용).
--   3) 게시판 author_nickname 사칭 — INSERT 시 author_nickname을 자유 지정할 수 있어
--      REST 직접 호출로 '운영자' 등 타인/관리자 닉네임 사칭 글·댓글 작성이 가능했다.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. news / timeline_events: 로그인한 비관리자도 공개(비삭제) 콘텐츠를 볼 수 있게
-- 기존 "Public read *"는 TO anon 전용이라 authenticated pending 회원은 어느 SELECT
-- 정책도 통과하지 못했다. anon 정책과 대칭으로 authenticated 공개 읽기를 추가한다.
-- (admin은 news_admin_read/timeline_admin_read로 삭제분까지 별도 열람 — 유지)
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "news_public_read_authenticated" ON public.news;
CREATE POLICY "news_public_read_authenticated" ON public.news
  FOR SELECT TO authenticated USING (NOT is_deleted);

DROP POLICY IF EXISTS "timeline_public_read_authenticated" ON public.timeline_events;
CREATE POLICY "timeline_public_read_authenticated" ON public.timeline_events
  FOR SELECT TO authenticated USING (NOT is_deleted);

-- ----------------------------------------------------------------------------
-- 2. board_reports: INSERT 컬럼을 축소해 status(및 기타) 위조 차단
-- reportTarget은 target_type/target_id/reporter_user_id/reason만 INSERT하고
-- status는 DEFAULT 'pending'으로 들어가야 한다. status를 GRANT에서 제외하면
-- 신고자가 status='resolved'로 자기 신고를 무력화하는 경로가 사라진다.
-- (editor의 status 변경은 resolveReports → board_reports_editor_update RLS로 유지)
-- ----------------------------------------------------------------------------

REVOKE INSERT ON public.board_reports FROM authenticated, anon;
GRANT INSERT (target_type, target_id, reporter_user_id, reason)
  ON public.board_reports TO authenticated;

-- ----------------------------------------------------------------------------
-- 3. 게시판 author_nickname 사칭 방지
-- author_user_id는 RLS WITH CHECK(author_user_id = auth.uid())로 본인만 강제되지만,
-- author_nickname은 자유 입력이라 REST 직접 호출로 임의 닉네임(타인/운영자) 사칭이 가능했다.
-- BEFORE INSERT 트리거가 작성자 본인의 실제 닉네임(admin_members.display_name)으로 덮어써
-- 앱을 우회한 INSERT도 사칭할 수 없게 한다. 닉네임 미설정이면 작성 자체를 거부한다.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION board_enforce_author_nickname()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE nick text;
BEGIN
  SELECT display_name INTO nick FROM admin_members
    WHERE user_id = NEW.author_user_id AND active
    LIMIT 1;
  IF nick IS NULL OR btrim(nick) = '' THEN
    RAISE EXCEPTION '게시판 작성 전 닉네임을 설정해야 합니다.';
  END IF;
  NEW.author_nickname := nick;  -- 입력값 무시, 실제 닉네임으로 고정(사칭 차단)
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS board_posts_author_nickname ON public.board_posts;
CREATE TRIGGER board_posts_author_nickname
  BEFORE INSERT ON public.board_posts
  FOR EACH ROW EXECUTE FUNCTION board_enforce_author_nickname();

DROP TRIGGER IF EXISTS board_comments_author_nickname ON public.board_comments;
CREATE TRIGGER board_comments_author_nickname
  BEFORE INSERT ON public.board_comments
  FOR EACH ROW EXECUTE FUNCTION board_enforce_author_nickname();
