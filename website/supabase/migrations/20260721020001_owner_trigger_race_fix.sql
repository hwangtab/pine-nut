-- ============================================================================
-- 적대적 감사 후속: enforce_min_one_owner 트리거 강화 (2026-07-21)
--   1) TOCTOU 경쟁 조건 제거 — 두 owner가 동시에 서로/자신을 강등하면 각 트랜잭션이
--      독립 스냅샷에서 remaining=1을 보고 둘 다 통과해 owner가 0명이 될 수 있었다.
--      다른 활성 owner 행을 FOR UPDATE로 잠가 동시 강등을 직렬화한다.
--   2) user_id가 NULL인 owner(로그인 불가 유령 행)는 유효 owner로 세지 않는다.
--      (auth.users를 대시보드에서 직접 삭제하면 ON DELETE SET NULL로 생길 수 있음)
-- ============================================================================

CREATE OR REPLACE FUNCTION enforce_min_one_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE remaining int;
BEGIN
  -- 변경 대상이 "활성 owner"였던 경우에만 검사
  IF OLD.role = 'owner' AND OLD.active THEN
    -- UPDATE 결과가 여전히 활성 owner이면 문제 없음
    IF TG_OP = 'UPDATE' AND NEW.role = 'owner' AND NEW.active THEN
      RETURN NEW;
    END IF;
    -- 자기 자신을 제외한 다른 "유효한(user_id 있는)" 활성 owner 행을 잠근다.
    -- FOR UPDATE는 동시 트랜잭션이 커밋한 최신 버전을 재평가하므로,
    -- 상대 owner가 방금 강등됐다면 role='owner' 조건에서 탈락해 remaining=0이 되어 거부된다.
    PERFORM 1 FROM admin_members
      WHERE role = 'owner' AND active AND user_id IS NOT NULL AND id <> OLD.id
      FOR UPDATE;
    GET DIAGNOSTICS remaining = ROW_COUNT;
    IF remaining = 0 THEN
      RAISE EXCEPTION '마지막 owner는 강등·비활성화·삭제할 수 없습니다.';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;
