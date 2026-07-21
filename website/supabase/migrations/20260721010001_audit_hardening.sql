-- ============================================================================
-- 보안 감사 후속 조치 (2026-07-21)
-- 회원가입/관리자 선정 전수 감사에서 발견된 결함을 DB 레벨에서 고정한다.
--   A. 이메일 폴백 매칭 제거 → 이메일 변경/재사용을 통한 권한 승계 차단
--   B. "owner 최소 1명" 불변식을 트리거로 강제(앱 우회 방지 + 전체 잠금 방지)
--   C. 숨김/삭제된 글의 첨부 이미지 노출 차단(버킷 private + 부모 상태 필터)
--   D. like_count 위조 차단(컬럼 레벨 UPDATE/INSERT 권한 축소)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- A. 판정 함수·정책에서 이메일 폴백 제거
-- 기존: (user_id = auth.uid() OR lower(email) = lower(jwt email))
-- 문제: user_id가 세팅된 행에도 이메일 OR이 무조건 적용되어, auth 사용자 삭제
--       (user_id→NULL) 후 이메일 재사용, 또는 이메일 변경 시 옛 행(owner 포함)의
--       권한이 새 계정으로 승계됨.
-- 조치: 가입 시 user_id를 항상 채우므로(가입 우선 모델) user_id 매칭만 사용한다.
--       이메일 문자열은 더 이상 신원 판정에 쓰지 않는다.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_active_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_members m
    WHERE m.active
      AND m.role IN ('owner','editor','viewer')
      AND m.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION admin_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.role FROM admin_members m
  WHERE m.active
    AND m.role IN ('owner', 'editor', 'viewer')
    AND m.user_id = auth.uid()
  ORDER BY CASE m.role WHEN 'owner' THEN 3 WHEN 'editor' THEN 2 ELSE 1 END DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION is_member()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_members m
    WHERE m.active
      AND m.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION set_my_nickname(new_nickname text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE updated int; trimmed text;
BEGIN
  trimmed := btrim(coalesce(new_nickname, ''));
  IF length(trimmed) < 2 OR length(trimmed) > 20 THEN
    RETURN false;
  END IF;
  UPDATE admin_members
    SET display_name = trimmed
    WHERE active AND user_id = auth.uid();
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated > 0;
END;
$$;

-- 본인 행 self-read: 이메일 폴백 제거(user_id 기준)
DROP POLICY IF EXISTS "admin_members_self_read" ON admin_members;
CREATE POLICY "admin_members_self_read" ON admin_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- B. "owner 최소 1명" 불변식 — DB 트리거로 강제
-- wouldRemoveLastOwner()는 앱(서버 액션)에만 있어, 브라우저에서 anon 클라이언트로
-- admin_members를 직접 UPDATE/DELETE하면 우회되어 전체 관리 패널이 영구 잠길 수 있다.
-- 트리거는 앱 경로 여부와 무관하게 마지막 활성 owner의 강등/비활성/삭제를 막는다.
-- ----------------------------------------------------------------------------

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
    -- 자기 자신을 제외한 다른 활성 owner가 하나도 없으면 거부
    SELECT count(*) INTO remaining FROM admin_members
      WHERE role = 'owner' AND active AND id <> OLD.id;
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

DROP TRIGGER IF EXISTS admin_members_min_one_owner ON admin_members;
CREATE TRIGGER admin_members_min_one_owner
  BEFORE UPDATE OR DELETE ON admin_members
  FOR EACH ROW EXECUTE FUNCTION enforce_min_one_owner();

-- ----------------------------------------------------------------------------
-- C. 숨김/삭제된 글의 첨부 이미지 노출 차단
-- 문제: board-images 버킷이 public=true라 CDN(getPublicUrl) 링크가 RLS·앱을 완전히
--       우회한다. 글을 숨겨도 이미지 URL만 알면 계속 열람 가능(모더레이션 우회).
-- 조치: (1) 버킷을 private으로 전환 → 접근은 서버가 발급한 signed URL로만.
--       (2) 메타 테이블/스토리지 SELECT 정책에 "부모 글이 공개 상태" 조건 추가.
--       앱은 getPublicUrl → createSignedUrls로 전환(별도 커밋).
-- ----------------------------------------------------------------------------

UPDATE storage.buckets SET public = false WHERE id = 'board-images';

DROP POLICY IF EXISTS "board_post_images_public_read" ON board_post_images;
CREATE POLICY "board_post_images_public_read" ON board_post_images
  FOR SELECT TO anon, authenticated USING (
    EXISTS (
      SELECT 1 FROM board_posts p
      WHERE p.id = post_id AND NOT p.is_deleted AND NOT p.is_hidden
    )
    OR is_active_admin()
  );

DROP POLICY IF EXISTS "board_images_public_read" ON storage.objects;
CREATE POLICY "board_images_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (
    bucket_id = 'board-images' AND (
      EXISTS (
        SELECT 1 FROM board_post_images bpi
        JOIN board_posts p ON p.id = bpi.post_id
        WHERE bpi.storage_path = storage.objects.name
          AND NOT p.is_deleted AND NOT p.is_hidden
      )
      OR is_active_admin()
    )
  );

-- ----------------------------------------------------------------------------
-- D. like_count 위조 차단 — 컬럼 레벨 권한 축소
-- 문제: board_posts_owner_update 정책이 컬럼 제한이 없어, 작성자가 REST로
--       {like_count: 99999}를 PATCH하면 좋아요 수를 위조할 수 있다.
-- 조치: authenticated의 board_posts INSERT/UPDATE 권한을 실제 필요한 컬럼으로 축소.
--       like_count는 SECURITY DEFINER 트리거(board_post_likes_maintain_count)만 갱신하므로
--       사용자 직접 변경 경로가 사라진다. author_user_id/created_at 등도 함께 보호된다.
-- ----------------------------------------------------------------------------

REVOKE INSERT, UPDATE ON public.board_posts FROM authenticated, anon;
GRANT INSERT (author_user_id, author_nickname, title, content, category)
  ON public.board_posts TO authenticated;
GRANT UPDATE (title, content, category, is_deleted, is_hidden)
  ON public.board_posts TO authenticated;
