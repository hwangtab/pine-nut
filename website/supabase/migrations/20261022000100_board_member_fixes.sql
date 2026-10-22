-- 게시판 회원 기능 감사 후속 (2026-10-22)
--
-- A. 일반 회원(pending 포함)이 본인 글·댓글을 삭제하지 못함
-- B. 제목·본문·댓글 길이 제한이 앱에만 있고 DB에는 없음
-- C. board-images 버킷에 용량·형식 제한이 없음
-- D. 글·댓글 작성 속도 제한 부재(도배)
-- E. log_audit에 일반 회원이 아무 table_name이나 기록 가능

-- ----------------------------------------------------------------------------
-- A. 본인 글·댓글 소프트 삭제 RPC
--
-- 앱은 update({is_deleted:true}).select("id").single()로 지웠다. PostgREST는 갱신된
-- 행을 다시 SELECT 정책으로 거르는데, 일반 회원이 쓸 수 있는 SELECT 정책은
-- public_read(NOT is_deleted AND NOT is_hidden)뿐이라 방금 지운 행이 걸러져 오류가 났다.
-- (기획단은 admin_read 정책 덕에 통과해 버그가 드러나지 않았다.)
-- 작성자·회원 여부를 함수 안에서 확인하고, 실제로 바뀐 행이 있었는지만 돌려준다.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.soft_delete_my_board_post(p_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated INT;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_member() THEN
    RETURN false;
  END IF;

  UPDATE public.board_posts
    SET is_deleted = true
    WHERE id = p_id AND author_user_id = auth.uid() AND NOT is_deleted;
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.soft_delete_my_board_post(BIGINT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.soft_delete_my_board_post(BIGINT) FROM anon;
GRANT EXECUTE ON FUNCTION public.soft_delete_my_board_post(BIGINT) TO authenticated;

CREATE OR REPLACE FUNCTION public.soft_delete_my_board_comment(p_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated INT;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_member() THEN
    RETURN false;
  END IF;

  UPDATE public.board_comments
    SET is_deleted = true
    WHERE id = p_id AND author_user_id = auth.uid() AND NOT is_deleted;
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.soft_delete_my_board_comment(BIGINT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.soft_delete_my_board_comment(BIGINT) FROM anon;
GRANT EXECUTE ON FUNCTION public.soft_delete_my_board_comment(BIGINT) TO authenticated;

-- ----------------------------------------------------------------------------
-- B. 길이 CHECK 제약 (앱 상한과 동일: 제목 200, 본문 20000, 댓글 2000)
--
-- REST 직접 호출로는 앱 검증을 건너뛸 수 있었다. 기존 행 중 위반이 있을 수 있어
-- NOT VALID로 건다 — 새 INSERT/UPDATE에만 적용되고 기존 행은 검사하지 않는다.
-- 앱은 trim 후 길이를 보지만 DB는 저장된 값 그대로 본다(앱이 trim해서 저장하므로 동일).
-- ----------------------------------------------------------------------------

ALTER TABLE public.board_posts DROP CONSTRAINT IF EXISTS board_posts_title_length;
ALTER TABLE public.board_posts
  ADD CONSTRAINT board_posts_title_length
  CHECK (char_length(title) BETWEEN 1 AND 200) NOT VALID;

ALTER TABLE public.board_posts DROP CONSTRAINT IF EXISTS board_posts_content_length;
ALTER TABLE public.board_posts
  ADD CONSTRAINT board_posts_content_length
  CHECK (char_length(content) BETWEEN 1 AND 20000) NOT VALID;

ALTER TABLE public.board_comments DROP CONSTRAINT IF EXISTS board_comments_content_length;
ALTER TABLE public.board_comments
  ADD CONSTRAINT board_comments_content_length
  CHECK (char_length(content) BETWEEN 1 AND 2000) NOT VALID;

-- ----------------------------------------------------------------------------
-- C. board-images 버킷 용량·형식 제한 (src/lib/image-upload-limits.ts와 동일)
--
-- 회원은 storage에 직접 업로드할 수 있으므로 앱 검사만으로는 막히지 않는다.
-- ----------------------------------------------------------------------------

UPDATE storage.buckets
  SET file_size_limit = 5 * 1024 * 1024,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
  WHERE id = 'board-images';

-- ----------------------------------------------------------------------------
-- D. 작성 속도 제한 (글 1시간 10개, 댓글 10분 30개)
--
-- 기획단(admin_can_edit)은 공지 등 일괄 작업이 있을 수 있어 제외한다.
-- 앱은 메시지 'board_rate_limited'를 보고 안내 문구로 바꾼다.
-- SECURITY DEFINER로 세야 RLS(숨김·삭제 행 제외)와 무관하게 본인 작성분을 모두 센다.
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_board_posts_author_created
  ON public.board_posts (author_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_board_comments_author_created
  ON public.board_comments (author_user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.board_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  IF public.admin_can_edit() THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'board_posts' THEN
    SELECT count(*) INTO v_count
    FROM public.board_posts
    WHERE author_user_id = NEW.author_user_id
      AND created_at >= now() - INTERVAL '1 hour';
    IF v_count >= 10 THEN
      RAISE EXCEPTION 'board_rate_limited' USING ERRCODE = 'P0001';
    END IF;
  ELSIF TG_TABLE_NAME = 'board_comments' THEN
    SELECT count(*) INTO v_count
    FROM public.board_comments
    WHERE author_user_id = NEW.author_user_id
      AND created_at >= now() - INTERVAL '10 minutes';
    IF v_count >= 30 THEN
      RAISE EXCEPTION 'board_rate_limited' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.board_rate_limit() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.board_rate_limit() FROM anon, authenticated;

DROP TRIGGER IF EXISTS board_posts_rate_limit ON public.board_posts;
CREATE TRIGGER board_posts_rate_limit
  BEFORE INSERT ON public.board_posts
  FOR EACH ROW EXECUTE FUNCTION public.board_rate_limit();

DROP TRIGGER IF EXISTS board_comments_rate_limit ON public.board_comments;
CREATE TRIGGER board_comments_rate_limit
  BEFORE INSERT ON public.board_comments
  FOR EACH ROW EXECUTE FUNCTION public.board_rate_limit();

-- ----------------------------------------------------------------------------
-- E. log_audit: 일반 회원은 board_% 테이블만 기록 가능
--
-- 20260811100002에서 회원도 기록할 수 있게 열었는데 table_name을 제한하지 않아,
-- 일반 회원이 'news'·'timeline' 등의 가짜 이력을 남겨 히스토리 화면을 오염시킬 수
-- 있었다. 관리자(viewer 포함) 동작은 그대로 유지한다.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.log_audit(
  p_table_name TEXT,
  p_record_id BIGINT,
  p_action TEXT,
  p_entity_key TEXT DEFAULT NULL,
  p_payload JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_is_admin BOOLEAN;
BEGIN
  -- 신원은 호출자 인자가 아니라 세션에서만 가져온다.
  v_email := auth.jwt() ->> 'email';
  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
  END IF;

  v_is_admin := public.is_active_admin();
  -- 관리자(viewer 포함)와 게시판 회원 모두 자기 활동을 남길 수 있어야 한다.
  IF NOT (v_is_admin OR public.is_member()) THEN
    RAISE EXCEPTION 'permission denied' USING ERRCODE = '42501';
  END IF;

  IF p_action NOT IN ('create', 'update', 'delete', 'restore', 'bulk_update') THEN
    RAISE EXCEPTION 'invalid audit action: %', p_action USING ERRCODE = '22023';
  END IF;

  IF p_table_name IS NULL OR length(p_table_name) = 0 OR length(p_table_name) > 100 THEN
    RAISE EXCEPTION 'invalid audit table_name' USING ERRCODE = '22023';
  END IF;

  -- 일반 회원은 게시판 활동만 남길 수 있다. LIKE의 '_'는 와일드카드라 접두사를 직접 비교한다.
  IF NOT v_is_admin AND left(p_table_name, 6) <> 'board_' THEN
    RAISE EXCEPTION 'permission denied' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.audit_log (
    table_name, record_id, action, user_email, entity_key, payload, created_at
  ) VALUES (
    p_table_name,
    COALESCE(p_record_id, 0),
    p_action,
    v_email,
    left(p_entity_key, 500),
    p_payload,
    now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.log_audit(TEXT, BIGINT, TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_audit(TEXT, BIGINT, TEXT, TEXT, JSONB) FROM anon;
GRANT EXECUTE ON FUNCTION public.log_audit(TEXT, BIGINT, TEXT, TEXT, JSONB) TO authenticated;
