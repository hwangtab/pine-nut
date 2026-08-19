-- Supabase security advisor WARN 대응 함수 하드닝. 기능 변화 없음.
--
-- 1) search_path 미고정 함수 2건 고정 (search_path 하이재킹 방지)
alter function public.update_updated_at() set search_path = 'public';
alter function public.enforce_signatures_rate_limit() set search_path = 'public';

-- 2) anon이 호출할 이유가 없는 SECURITY DEFINER RPC의 EXECUTE 회수.
--    (모두 내부에서 세션을 요구하므로 anon 호출은 어차피 실패하지만 표면적을 줄인다.)
--    주의: is_active_admin·is_member·admin_can_edit·admin_role·is_admin_owner는
--    anon 대상 RLS 정책(게시판 공개 읽기 등)이 평가 시 호출하므로 회수하면 안 된다.
revoke execute on function public.log_audit(text, bigint, text, text, jsonb) from anon;
revoke execute on function public.replace_meeting_children(bigint, jsonb, jsonb, jsonb, jsonb) from anon;
revoke execute on function public.report_board_target(text, bigint, text) from anon;
revoke execute on function public.set_my_nickname(text) from anon;
revoke execute on function public.set_my_nickname_v2(text) from anon;

-- 3) 트리거 전용 함수는 RPC로 호출될 일이 없다 — anon·authenticated 모두 회수.
--    (트리거는 소유자 권한으로 실행되므로 영향 없음)
revoke execute on function public.update_updated_at() from anon, authenticated;
revoke execute on function public.enforce_signatures_rate_limit() from anon, authenticated;
revoke execute on function public.enforce_min_one_owner() from anon, authenticated;
revoke execute on function public.sync_author_nickname_on_rename() from anon, authenticated;
revoke execute on function public.board_enforce_author_nickname() from anon, authenticated;
revoke execute on function public.board_guard_is_hidden() from anon, authenticated;
revoke execute on function public.board_post_likes_maintain_count() from anon, authenticated;
revoke execute on function public.rls_auto_enable() from anon, authenticated;
