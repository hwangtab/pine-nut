-- 4라운드 델타 감사 대응 (2026-08-13)
--
-- A. 닉네임 중복 정리가 기존 글의 표시 이름과 어긋난 것을 맞춘다
-- B. 이미 숨김 처리된 글·댓글을 다시 신고할 수 있던 구멍을 막는다

-- ----------------------------------------------------------------------------
-- A. display_name ↔ author_nickname 동기화
--
-- 20260811110002가 중복 닉네임을 "이름_id"로 정리했지만, 이미 작성된
-- board_posts/board_comments.author_nickname은 그대로 남았다. author_nickname을
-- 강제하는 트리거(20260721040001)는 INSERT 시에만 동작하기 때문이다.
-- 그 결과 "사칭을 막았다"고 해놓고 기존 글에서는 두 사람이 같은 이름으로 보인다.
--
-- 지금 한 번 맞추고, 앞으로 닉네임이 바뀔 때마다 기존 글도 따라가도록 트리거를 건다.
-- ----------------------------------------------------------------------------

UPDATE public.board_posts p
SET author_nickname = m.display_name
FROM public.admin_members m
WHERE p.author_user_id = m.user_id
  AND m.display_name IS NOT NULL
  AND btrim(m.display_name) <> ''
  AND p.author_nickname IS DISTINCT FROM m.display_name;

UPDATE public.board_comments c
SET author_nickname = m.display_name
FROM public.admin_members m
WHERE c.author_user_id = m.user_id
  AND m.display_name IS NOT NULL
  AND btrim(m.display_name) <> ''
  AND c.author_nickname IS DISTINCT FROM m.display_name;

CREATE OR REPLACE FUNCTION public.sync_author_nickname_on_rename()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.display_name IS DISTINCT FROM OLD.display_name
     AND NEW.display_name IS NOT NULL
     AND btrim(NEW.display_name) <> ''
     AND NEW.user_id IS NOT NULL
  THEN
    UPDATE public.board_posts
      SET author_nickname = NEW.display_name
      WHERE author_user_id = NEW.user_id;
    UPDATE public.board_comments
      SET author_nickname = NEW.display_name
      WHERE author_user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS admin_members_sync_nickname ON public.admin_members;
CREATE TRIGGER admin_members_sync_nickname
  AFTER UPDATE OF display_name ON public.admin_members
  FOR EACH ROW EXECUTE FUNCTION public.sync_author_nickname_on_rename();

-- ----------------------------------------------------------------------------
-- B. 숨김 처리된 대상은 신고할 수 없게 한다
--
-- report_board_target은 is_deleted만 확인해, 기획단이 이미 숨긴 글도 계속 신고할 수
-- 있었다(예전에는 RLS SELECT가 숨김 글을 가려 앱 단계에서 자연히 걸렸다).
-- 검토가 끝난 항목이 큐에 다시 쌓이는 것을 막는다.
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

  -- 살아 있고 아직 숨겨지지 않은 대상만 신고 가능하다.
  IF p_target_type = 'post' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.board_posts
      WHERE id = p_target_id AND NOT is_deleted AND NOT is_hidden
    ) INTO v_exists;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM public.board_comments
      WHERE id = p_target_id AND NOT is_deleted AND NOT is_hidden
    ) INTO v_exists;
  END IF;
  IF NOT v_exists THEN
    RETURN 'not_found';
  END IF;

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
