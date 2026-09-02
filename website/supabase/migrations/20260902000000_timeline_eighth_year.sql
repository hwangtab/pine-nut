-- 공개 타임라인의 투쟁 연차 표기 정정 (2026-09-02)
--
-- 첫 집회는 2019년 3월이다. 2026년 9월 기준으로 7년 6개월이 지났으므로
-- 햇수로는 여덟 해째다. "7년이 넘는"은 틀리지 않지만 반년을 깎아 말하고,
-- 보도자료가 쓰던 "7년째"는 한 해 적게 센 것이었다. 웹 카피는 모두 "8년째"로
-- 통일했고, DB의 timeline_events 만 남아 공개 타임라인에서 어긋난다.
--
-- 조건부로만 갱신한다: 관리자가 이미 손댄 문장은 건드리지 않는다.

-- "2026년 현재" 항목
UPDATE public.timeline_events
SET description = '8년째에 접어들었지만 풍천리 주민들의 투쟁은 계속되고 있습니다. 정기 집회는 705여 차를 넘어섰고, 전국 140여 개 단체가 연대에 합류하며 풍천리의 싸움은 지역을 넘어 전국적인 환경·주민권 이슈로 확산되고 있습니다.',
    updated_at = now()
WHERE title = '투쟁 계속, 전국 140여 개 단체 연대'
  AND description LIKE '%7년이 넘는 시간이 흘렀지만%';

-- 2026년 8월 5일 장관 면담 항목의 맺음 문장
UPDATE public.timeline_events
SET description = replace(description, '7년 넘게 백지화를 요구해온', '8년째 백지화를 요구해온'),
    updated_at = now()
WHERE description LIKE '%7년 넘게 백지화를 요구해온%';

-- 2019년 대책위 결성 항목
UPDATE public.timeline_events
SET description = replace(description, '이때부터 7년이 넘는 장기 투쟁의', '이때부터 8년째 이어지는 장기 투쟁의'),
    updated_at = now()
WHERE description LIKE '%이때부터 7년이 넘는 장기 투쟁의%';
