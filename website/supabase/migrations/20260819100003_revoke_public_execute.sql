-- 직전 하드닝 후속: 일부 함수는 anon 개별 grant가 아니라 PUBLIC 기본 grant로
-- 실행 가능한 상태였다(revoke from anon만으로는 안 막힘). PUBLIC까지 회수한다.
--
-- 트리거 전용 함수 — 트리거 실행은 소유자 권한이라 영향 없음
revoke execute on function public.update_updated_at() from public;
revoke execute on function public.enforce_signatures_rate_limit() from public;
revoke execute on function public.enforce_min_one_owner() from public;
revoke execute on function public.sync_author_nickname_on_rename() from public;
revoke execute on function public.board_enforce_author_nickname() from public;
revoke execute on function public.board_guard_is_hidden() from public;
revoke execute on function public.board_post_likes_maintain_count() from public;
revoke execute on function public.rls_auto_enable() from public;

-- 레거시 닉네임 함수 — 코드가 authenticated 세션으로만 호출하므로 PUBLIC 회수 후
-- authenticated에만 명시적으로 재부여
revoke execute on function public.set_my_nickname(text) from public;
grant execute on function public.set_my_nickname(text) to authenticated;

-- 세션 필수 RPC들도 같은 패턴으로 정리 (authenticated만 유지)
revoke execute on function public.log_audit(text, bigint, text, text, jsonb) from public;
grant execute on function public.log_audit(text, bigint, text, text, jsonb) to authenticated;
revoke execute on function public.replace_meeting_children(bigint, jsonb, jsonb, jsonb, jsonb) from public;
grant execute on function public.replace_meeting_children(bigint, jsonb, jsonb, jsonb, jsonb) to authenticated;
revoke execute on function public.report_board_target(text, bigint, text) from public;
grant execute on function public.report_board_target(text, bigint, text) to authenticated;
revoke execute on function public.set_my_nickname_v2(text) from public;
grant execute on function public.set_my_nickname_v2(text) to authenticated;

-- 참고: is_active_admin·is_member·admin_can_edit·admin_role·is_admin_owner는
-- anon 대상 RLS 정책이 평가 시 호출하므로 의도적으로 회수하지 않는다.
