-- 2라운드 적대적 감사 대응: 게시판 RLS·신고·닉네임 (2026-08-11)
--
-- A. 신고 건수 제한이 일반 회원에게 무력 — 앱이 RLS 걸린 테이블을 count해 게이트로 썼다
-- B. 숨김/삭제된 글의 댓글이 REST로 그대로 열람됨 (부모 글 상태 미검사)
-- C. 제명·비활성화된 회원이 REST 직접 호출로 본인 글을 계속 수정·삭제
-- D. 닉네임 중복 검사 부재 — 타인 닉네임 사칭 가능

-- ----------------------------------------------------------------------------
-- A. 신고를 SECURITY DEFINER RPC로 이관
--
-- 기존 앱 코드는 board_reports를 SELECT해 본인 신고 수를 셌다. 그런데 SELECT 정책은
-- admin_can_edit()뿐이라, 제한 대상인 일반 회원의 세션에서는 RLS가 전부 걸러 count가
-- 언제나 0이었다. 제한이 정확히 반대로(editor에게만) 걸렸다.
-- 대상 확인 · 건수 제한 · INSERT를 한 함수에서 원자적으로 처리한다.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.report_board_target(
  p_target_type TEXT,
  p_target_id BIGINT,
  p_reason TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_count INT;
  v_exists BOOLEAN;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL OR NOT public.is_member() THEN
    RETURN 'forbidden';
  END IF;

  IF p_target_type NOT IN ('post', 'comment') THEN
    RETURN 'invalid_target';
  END IF;

  IF p_reason IS NULL OR btrim(p_reason) = '' OR length(p_reason) > 200 THEN
    RETURN 'invalid_reason';
  END IF;

  -- 대상이 실제로 존재하고 살아 있어야 한다(검토 화면의 유령 항목 방지).
  IF p_target_type = 'post' THEN
    SELECT EXISTS (SELECT 1 FROM public.board_posts WHERE id = p_target_id AND NOT is_deleted)
      INTO v_exists;
  ELSE
    SELECT EXISTS (SELECT 1 FROM public.board_comments WHERE id = p_target_id AND NOT is_deleted)
      INTO v_exists;
  END IF;
  IF NOT v_exists THEN
    RETURN 'not_found';
  END IF;

  -- RLS를 우회하는 함수 안에서 세므로 일반 회원에게도 실제로 걸린다.
  SELECT count(*) INTO v_count
  FROM public.board_reports
  WHERE reporter_user_id = v_uid
    AND created_at >= now() - INTERVAL '24 hours';
  IF v_count >= 20 THEN
    RETURN 'rate_limited';
  END IF;

  BEGIN
    INSERT INTO public.board_reports (target_type, target_id, reporter_user_id, reason)
    VALUES (p_target_type, p_target_id, v_uid, btrim(p_reason));
  EXCEPTION WHEN unique_violation THEN
    RETURN 'duplicate';
  END;

  RETURN 'ok';
END;
$$;

REVOKE ALL ON FUNCTION public.report_board_target(TEXT, BIGINT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_board_target(TEXT, BIGINT, TEXT) TO authenticated;

-- 신고자가 자기 신고를 확인할 수 있어야 중복 신고 안내 등이 정상 동작한다.
DROP POLICY IF EXISTS "board_reports_self_read" ON public.board_reports;
CREATE POLICY "board_reports_self_read" ON public.board_reports
  FOR SELECT TO authenticated
  USING (reporter_user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- B. 숨김/삭제된 글의 댓글 노출 차단
--
-- 댓글 자신의 is_deleted/is_hidden만 봤기 때문에, 글을 숨겨도 그 글의 댓글은
-- anon 키 REST 조회로 그대로 읽혔다(모더레이션 우회). 부모 글 상태를 함께 본다.
-- board_post_images 정책(20260721010001)과 같은 형태다.
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "board_comments_public_read" ON public.board_comments;
CREATE POLICY "board_comments_public_read" ON public.board_comments
  FOR SELECT TO anon, authenticated
  USING (
    NOT is_deleted
    AND NOT is_hidden
    AND EXISTS (
      SELECT 1 FROM public.board_posts p
      WHERE p.id = post_id AND NOT p.is_deleted AND NOT p.is_hidden
    )
  );

-- ----------------------------------------------------------------------------
-- C. 제명·비활성 회원의 본인 글 수정·삭제 차단
--
-- owner_update 정책이 작성자 일치만 봤다. 명부에서 제거되거나 active=false가 된
-- 뒤에도 세션이 살아 있으면 REST 직접 호출로 계속 글을 고칠 수 있었다.
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "board_posts_owner_update" ON public.board_posts;
CREATE POLICY "board_posts_owner_update" ON public.board_posts
  FOR UPDATE TO authenticated
  USING (author_user_id = auth.uid() AND public.is_member())
  WITH CHECK (author_user_id = auth.uid() AND public.is_member());

DROP POLICY IF EXISTS "board_comments_owner_update" ON public.board_comments;
CREATE POLICY "board_comments_owner_update" ON public.board_comments
  FOR UPDATE TO authenticated
  USING (author_user_id = auth.uid() AND public.is_member())
  WITH CHECK (author_user_id = auth.uid() AND public.is_member());

-- ----------------------------------------------------------------------------
-- D. 닉네임 중복(사칭) 차단
--
-- set_my_nickname은 길이만 검사했다. 다른 회원과 같은 닉네임을 그대로 쓸 수 있어
-- 게시판에서 특정 인물을 사칭할 수 있었다. 대소문자·공백을 정규화해 유일성을 건다.
-- ----------------------------------------------------------------------------

-- 기존 중복이 있으면 인덱스 생성이 실패한다. 뒤에 온 행에 접미사를 붙여 정리한다.
WITH ranked AS (
  SELECT id,
         display_name,
         row_number() OVER (
           PARTITION BY lower(btrim(display_name)) ORDER BY id
         ) AS rn
  FROM public.admin_members
  WHERE display_name IS NOT NULL AND btrim(display_name) <> ''
)
UPDATE public.admin_members m
SET display_name = left(r.display_name, 14) || '_' || r.id
FROM ranked r
WHERE m.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS admin_members_display_name_unique
  ON public.admin_members (lower(btrim(display_name)))
  WHERE display_name IS NOT NULL AND btrim(display_name) <> '';

-- 닉네임 설정 RPC: 사유를 구분해 돌려준다(기존 boolean은 실패 원인을 알 수 없었다).
CREATE OR REPLACE FUNCTION public.set_my_nickname_v2(new_nickname TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trimmed TEXT;
  updated INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 'forbidden';
  END IF;

  trimmed := btrim(coalesce(new_nickname, ''));
  -- 제어문자·연속 공백 차단
  IF trimmed ~ '[[:cntrl:]]' OR trimmed ~ '\s\s' THEN
    RETURN 'invalid';
  END IF;
  IF length(trimmed) < 2 OR length(trimmed) > 20 THEN
    RETURN 'invalid';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.admin_members
    WHERE lower(btrim(display_name)) = lower(trimmed)
      AND user_id IS DISTINCT FROM auth.uid()
  ) THEN
    RETURN 'duplicate';
  END IF;

  UPDATE public.admin_members
    SET display_name = trimmed
    WHERE active AND user_id = auth.uid();
  GET DIAGNOSTICS updated = ROW_COUNT;

  IF updated = 0 THEN
    RETURN 'not_member';
  END IF;
  RETURN 'ok';
END;
$$;

REVOKE ALL ON FUNCTION public.set_my_nickname_v2(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_my_nickname_v2(TEXT) TO authenticated;
