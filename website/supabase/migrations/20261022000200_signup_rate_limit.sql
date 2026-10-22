-- 관리자 자가 가입(/admin/signup → claimAdminAccount) 레이트리밋.
--
-- claimAdminAccount는 비로그인으로 호출되고, 이메일 확인 없이 확인된(email_confirm)
-- auth 계정을 만든다. 메일 발송 인프라가 없어 확인 메일은 붙일 수 없으므로, 최소한
-- 대량 계정 생성·이메일 존재 여부 탐색·고스트 복구 경로의 비밀번호 대입을 시간당
-- 횟수로 묶는다.
--   - 같은 IP: 1시간에 3회
--   - 전체:    1시간에 20회 (IP를 바꿔 가며 들어오는 경우의 상한)
--
-- IP는 원문을 저장하지 않는다. 앱이 서명 API와 같은 방식(HMAC-SHA256, IP_HASH_PEPPER)으로
-- 만든 해시만 넘긴다.

create table if not exists public.admin_signup_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists admin_signup_attempts_ip_created_idx
  on public.admin_signup_attempts (ip_hash, created_at desc);
create index if not exists admin_signup_attempts_created_idx
  on public.admin_signup_attempts (created_at);

-- 정책 없이 RLS만 켠다 → anon/authenticated는 읽기·쓰기 모두 불가. 접근은 아래
-- SECURITY DEFINER 함수(service_role 전용)로만 한다.
alter table public.admin_signup_attempts enable row level security;
revoke all on table public.admin_signup_attempts from anon, authenticated;

-- 슬롯 하나를 원자적으로 확인·소비한다. 반환값: 'ok' | 'ip_limited' | 'global_limited'.
-- 동시 요청이 같은 시점의 count를 함께 보고 둘 다 통과하지 않도록 트랜잭션 advisory
-- lock으로 직렬화한다(가입은 저빈도라 경합 비용이 없다).
create or replace function public.claim_admin_signup_slot(p_ip_hash text)
returns text
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_ip_count integer;
  v_global_count integer;
begin
  if p_ip_hash is null or btrim(p_ip_hash) = '' then
    raise exception 'invalid_ip_hash';
  end if;

  perform pg_advisory_xact_lock(hashtext('claim_admin_signup_slot'));

  -- 하루 지난 기록은 판단에 쓰이지 않는다 → 함께 정리해 테이블이 자라지 않게 한다.
  delete from admin_signup_attempts where created_at < now() - interval '1 day';

  select count(*) into v_global_count
    from admin_signup_attempts
   where created_at >= now() - interval '1 hour';
  if v_global_count >= 20 then
    return 'global_limited';
  end if;

  select count(*) into v_ip_count
    from admin_signup_attempts
   where ip_hash = p_ip_hash
     and created_at >= now() - interval '1 hour';
  if v_ip_count >= 3 then
    return 'ip_limited';
  end if;

  insert into admin_signup_attempts (ip_hash) values (p_ip_hash);
  return 'ok';
end;
$$;

-- 기본 grant는 PUBLIC이다. 회수하지 않으면 anon 키로 남의 슬롯을 소진시켜
-- 가입 자체를 막는 경로가 열린다.
revoke execute on function public.claim_admin_signup_slot(text) from public;
revoke execute on function public.claim_admin_signup_slot(text) from anon, authenticated;
grant execute on function public.claim_admin_signup_slot(text) to service_role;
