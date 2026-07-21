-- ============================================================================
-- 적대적 감사 후속 2: board_comments 컬럼 레벨 권한 축소 (2026-07-21)
-- 20260721010001에서 board_posts에만 적용한 컬럼 GRANT 축소를 board_comments에도 적용한다.
-- 누락 시 문제: board_comments_owner_update 정책이 행 수준(author_user_id=auth.uid())만
-- 검사하고 컬럼 제한이 없어, 작성자가 REST로 본인 댓글의 author_nickname(타 회원/운영자 사칭)·
-- created_at(시간 위조)·post_id(다른 글로 이동)를 PATCH할 수 있다.
-- 조치: authenticated의 board_comments INSERT/UPDATE 권한을 실제 필요한 컬럼으로 축소.
--   INSERT: createBoardComment가 쓰는 4개 컬럼
--   UPDATE: deleteBoardComment(is_deleted)·setCommentHidden(is_hidden)만 (댓글 본문 수정 기능 없음)
--   is_hidden은 board_guard_is_hidden 트리거가 비관리자 변경을 되돌려 이중 방어한다.
-- ============================================================================

REVOKE INSERT, UPDATE ON public.board_comments FROM authenticated, anon;
GRANT INSERT (post_id, author_user_id, author_nickname, content)
  ON public.board_comments TO authenticated;
GRANT UPDATE (is_deleted, is_hidden)
  ON public.board_comments TO authenticated;
