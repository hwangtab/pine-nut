-- 2026년 8월: 김성환 기후에너지환경부 장관, 주민 대책위 면담서 '공사 강행' 입장
-- 타임라인(timeline_events)에 항목 추가. 재실행/리셋에도 중복되지 않도록 idempotent 처리.
-- 배치: "투쟁 계속(2026년 현재)" 항목 바로 앞에 삽입. 해당 항목이 없으면 맨 뒤에 추가.

do $$
declare
  target integer;
begin
  -- 이미 존재하면 아무 작업도 하지 않음
  if exists (
    select 1 from public.timeline_events
    where title like '김성환 기후에너지환경부 장관%'
      and is_deleted = false
  ) then
    return;
  end if;

  select sort_order into target
  from public.timeline_events
  where title like '%투쟁 계속%'
    and is_deleted = false
  order by sort_order
  limit 1;

  if target is null then
    select coalesce(max(sort_order), 0) + 1 into target
    from public.timeline_events;
  else
    update public.timeline_events
    set sort_order = sort_order + 1
    where sort_order >= target;
  end if;

  insert into public.timeline_events (date, year, title, description, category, sort_order)
  values (
    '2026년 8월',
    2026,
    '김성환 기후에너지환경부 장관, 주민 대책위 면담서 ''공사 강행'' 입장',
    '풍천리 주민 대책위가 김성환 기후에너지환경부 장관을 면담했으나, 장관은 사업을 막을 수 없다며 계속 추진하겠다는 입장을 밝혔습니다. 정부가 제시한 근거는 다음과 같습니다. 첫째, 사업 추진 과정에 이렇다 할 법적 하자는 없었다. 둘째, 홍천군·홍천군의회 차원의 의견수렴 과정(주민설명회, 사회단체·주민의 유치 찬성 서명부, 홍천군의회 동의 등)을 거쳤다. 셋째, 반대 의견수렴에 부족함은 있었으나 그 자체로 인허가 절차에 하자가 있었다고 보긴 힘들다. 넷째, 사업 중단 시 약 3,000억 원의 매몰 비용이 발생한다는 점도 백지화를 결정하기 어려운 요인이다. 다섯째, 산림 상태 변경 결정에 산림청이 사실상 동의했다. 7년 넘게 백지화를 요구해온 주민들에게는 사실상의 강행 통보였습니다.',
    '회의',
    target
  );
end $$;
