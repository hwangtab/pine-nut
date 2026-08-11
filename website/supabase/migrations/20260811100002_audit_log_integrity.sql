-- 감사 로그 무결성 강화 (2026-08-11)
--
-- 문제 1) audit_editor_insert 정책이 WITH CHECK (admin_can_edit())뿐이라, editor가
--         REST로 audit_log에 임의 행을 직접 INSERT할 수 있었다. user_email·created_at도
--         클라이언트가 지정할 수 있어 "다른 사람이 한 것처럼" 위조하거나, 무의미한
--         행을 대량 삽입해 실제 이력을 히스토리 화면 밖으로 밀어낼 수 있었다.
-- 문제 2) 반대로 일반 회원(is_member)은 INSERT 정책에 걸려 게시판 활동이 전혀
--         기록되지 않았는데, 앱은 실패를 삼키고 성공한 것처럼 진행했다.
--
-- 조치: 직접 INSERT 경로를 없애고 SECURITY DEFINER 함수 하나로만 기록하게 한다.
--       user_email은 세션 JWT에서 서버가 채우므로 호출자가 위조할 수 없다.

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
BEGIN
  -- 신원은 호출자 인자가 아니라 세션에서만 가져온다.
  v_email := auth.jwt() ->> 'email';
  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
  END IF;

  -- 관리자(viewer 포함)와 게시판 회원 모두 자기 활동을 남길 수 있어야 한다.
  IF NOT (public.is_active_admin() OR public.is_member()) THEN
    RAISE EXCEPTION 'permission denied' USING ERRCODE = '42501';
  END IF;

  IF p_action NOT IN ('create', 'update', 'delete', 'restore', 'bulk_update') THEN
    RAISE EXCEPTION 'invalid audit action: %', p_action USING ERRCODE = '22023';
  END IF;

  IF p_table_name IS NULL OR length(p_table_name) = 0 OR length(p_table_name) > 100 THEN
    RAISE EXCEPTION 'invalid audit table_name' USING ERRCODE = '22023';
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
GRANT EXECUTE ON FUNCTION public.log_audit(TEXT, BIGINT, TEXT, TEXT, JSONB) TO authenticated;

-- 직접 INSERT 경로 제거. 이제 기록은 log_audit()으로만 가능하다.
DROP POLICY IF EXISTS "audit_editor_insert" ON public.audit_log;
DROP POLICY IF EXISTS "audit_admin_insert" ON public.audit_log;
DROP POLICY IF EXISTS "Authenticated insert audit" ON public.audit_log;
REVOKE INSERT, UPDATE, DELETE ON public.audit_log FROM authenticated, anon;

-- 감사 이력은 누구도 사후에 고치거나 지울 수 없어야 한다(서비스 롤 제외).
DROP POLICY IF EXISTS "audit_no_update" ON public.audit_log;
CREATE POLICY "audit_no_update" ON public.audit_log
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "audit_no_delete" ON public.audit_log;
CREATE POLICY "audit_no_delete" ON public.audit_log
  FOR DELETE TO authenticated USING (false);
