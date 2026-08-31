-- 재서명 = 마지막 값으로 갱신.
--
-- 그전까지 서명 저장은 INSERT 전용이었다. 같은 이메일로 다시 서명하면 유일
-- 인덱스(idx_signatures_unique_email)에 걸려 23505 → 409로 거부됐고, 고쳐 쓴
-- 제안 한마디도 공개로 바꾼 동의 값도 그대로 버려졌다. 이름 비공개로 서명한
-- 뒤 마음을 바꾼 사람에게 정정할 방법이 아예 없었다는 뜻이다.
--
-- 애플리케이션 코드에서 "SELECT 후 있으면 UPDATE"로 처리하지 않는다. 두 요청이
-- 동시에 들어오면 둘 다 "없음"을 보고 둘 다 INSERT해 하나가 23505로 죽는다.
-- INSERT ... ON CONFLICT DO UPDATE는 이 판정을 한 문장 안에서 원자적으로
-- 처리한다. 부분 유일 인덱스를 추론하려면 인덱스 술어(WHERE ...)를 ON CONFLICT
-- 절에 그대로 적어야 한다 — 빼면 "no unique or exclusion constraint matching
-- the ON CONFLICT specification" 오류가 난다.
--
-- 이메일이 없는 서명은 갱신 대상을 특정할 수 없다. 이름+지역으로 묶으면 같은
-- 지역 동명이인의 서명이 서로를 덮어써 한 사람의 참여가 조용히 사라진다.
-- 그래서 이메일이 없으면 종전대로 새 행을 만든다.
--
-- 이름 일치 요구(DO UPDATE ... WHERE): 이메일만으로 덮어쓰게 두면, 남의 이메일을
-- 아는 사람이 그 사람의 서명을 통째로 바꿀 수 있다 — 이름을 바꾸거나, 비공개를
-- 공개로 뒤집거나, 그 사람 명의로 명단에 아무 문장이나 띄우는 일까지. 제안
-- 한마디가 명단에 공개되기 시작한 뒤로는 실제 악용 가치가 있는 표면이다.
-- 그래서 기존 행과 이름이 같을 때만 갱신하고, 다르면 갱신하지 않은 채
-- signature_name_mismatch로 거절한다(앱이 409 + 안내 문구로 옮긴다).
-- 대소문자·앞뒤 공백은 무시한다 — 사람이 같은 이름을 다시 칠 때 그 정도 차이는
-- 늘 생긴다. 이름 자체를 고치려는 사람은 이 규칙에 막히므로, 그 경우는 운영진이
-- 처리한다.

alter table signatures add column if not exists updated_at timestamptz;

comment on column signatures.updated_at is
  '재서명으로 내용이 갱신된 시각. 최초 접수만 있었으면 NULL. created_at은 최초 서명일로 보존한다 — 명단 벽이 공개하는 "서명한 날짜"가 정정 때문에 뒤로 밀리면 안 된다.';

create or replace function public.submit_signature(
  p_name text,
  p_email text,
  p_message text,
  p_region_top text,
  p_region_sub text,
  p_affiliation text,
  p_name_public boolean,
  p_ip_hash text,
  p_consent_privacy boolean,
  p_consent_age boolean
) returns text
language plpgsql
security invoker
set search_path = 'public'
as $$
declare
  v_inserted boolean;
begin
  -- 이메일 없는 서명: 동일인 판정 근거가 없으므로 항상 새 행.
  if p_email is null or btrim(p_email) = '' then
    insert into signatures (
      name, email, message, region_top, region_sub,
      affiliation, name_public, ip_hash, consent_privacy, consent_age
    ) values (
      p_name, null, p_message, p_region_top, p_region_sub,
      p_affiliation, p_name_public, p_ip_hash, p_consent_privacy, p_consent_age
    );
    return 'created';
  end if;

  insert into signatures (
    name, email, message, region_top, region_sub,
    affiliation, name_public, ip_hash, consent_privacy, consent_age
  ) values (
    p_name, p_email, p_message, p_region_top, p_region_sub,
    p_affiliation, p_name_public, p_ip_hash, p_consent_privacy, p_consent_age
  )
  on conflict (lower(btrim(email))) where email is not null and btrim(email) <> ''
  do update set
    name            = excluded.name,
    message         = excluded.message,
    region_top      = excluded.region_top,
    region_sub      = excluded.region_sub,
    affiliation     = excluded.affiliation,
    name_public     = excluded.name_public,
    ip_hash         = excluded.ip_hash,
    consent_privacy = excluded.consent_privacy,
    consent_age     = excluded.consent_age,
    updated_at      = now()
  where lower(btrim(signatures.name)) = lower(btrim(excluded.name))
  -- xmax = 0은 이 행이 이번 문장에서 새로 삽입됐다는 뜻이다. 갱신된 행은
  -- 갱신을 수행한 트랜잭션 id가 xmax에 실린다. ON CONFLICT에서 삽입·갱신을
  -- 구분하는 표준 관용구다.
  returning (xmax = 0) into v_inserted;

  -- DO UPDATE의 WHERE가 거짓이면 삽입도 갱신도 일어나지 않아 RETURNING이 아무
  -- 행도 돌려주지 않는다 — 그때 v_inserted는 NULL이다. 즉 "이 이메일로 이미
  -- 서명이 있는데 이름이 다르다"는 뜻이다.
  if v_inserted is null then
    raise exception 'signature_name_mismatch';
  end if;

  -- created_at은 건드리지 않는다(최초 서명일 보존). 갱신 시각은 updated_at에.
  return case when v_inserted then 'created' else 'updated' end;
end;
$$;

-- 기본 grant는 PUBLIC이다. 회수하지 않으면 anon 키로도 호출할 수 있고, 그러면
-- 서명 API의 레이트리밋·검증을 통째로 우회하는 경로가 열린다.
revoke execute on function public.submit_signature(
  text, text, text, text, text, text, boolean, text, boolean, boolean
) from public;
grant execute on function public.submit_signature(
  text, text, text, text, text, text, boolean, text, boolean, boolean
) to service_role;
