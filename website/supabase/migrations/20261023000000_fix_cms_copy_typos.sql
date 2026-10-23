-- 관리자 편집값(page_content)에 남은 표기 오류 정정.
--
-- - "까막딱다구리" → "까막딱따구리": 홈 위협 카드(home.impact.cards), 이야기
--   이유 카드(story.reasons.cards), 보도자료 사실표(press.facts.items,
--   press.factsheet.items). 코드 기본값은 이미 바른 표기다.
-- - 홈 통계 "11만+1,999그루" → "약 11만 1,999그루": 같은 페이지 위협 카드와 서명
--   성명문(petition.statement.*)이 쓰는 표기에 맞춘다.
--
-- replace()라 해당 문자열이 없으면 아무것도 바뀌지 않는다(재실행 안전).

UPDATE public.page_content
SET value = replace(value, '까막딱다구리', '까막딱따구리'),
    updated_at = now()
WHERE content_key IN (
    'home.impact.cards',
    'story.reasons.cards',
    'press.facts.items',
    'press.factsheet.items'
  )
  AND value LIKE '%까막딱다구리%';

UPDATE public.page_content
SET value = replace(value, '"11만+1,999그루"', '"약 11만 1,999그루"'),
    updated_at = now()
WHERE content_key = 'home.stats.items'
  AND value LIKE '%"11만+1,999그루"%';
