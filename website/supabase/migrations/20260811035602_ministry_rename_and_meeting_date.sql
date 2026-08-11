-- 부처 개칭 반영: 산업통상자원부 → 기후에너지환경부 (라이브 콘텐츠 전반)
-- + 김성환 장관 면담 타임라인 항목 날짜 보정: '2026년 8월' → '2026년 8월 5일'
-- replace()는 이미 교체된 텍스트에 무해(idempotent).

-- 1) 면담 날짜 보정
update public.timeline_events
set date = '2026년 8월 5일'
where title like '김성환 기후에너지환경부 장관%'
  and date = '2026년 8월';

-- 2) 타임라인 부처명 교체
update public.timeline_events
set title = replace(title, '산업통상자원부', '기후에너지환경부'),
    description = replace(description, '산업통상자원부', '기후에너지환경부')
where title like '%산업통상자원부%'
   or description like '%산업통상자원부%';

-- 3) 뉴스 부처명 교체
update public.news
set title = replace(title, '산업통상자원부', '기후에너지환경부'),
    summary = replace(summary, '산업통상자원부', '기후에너지환경부'),
    content = replace(content, '산업통상자원부', '기후에너지환경부')
where title like '%산업통상자원부%'
   or summary like '%산업통상자원부%'
   or content like '%산업통상자원부%';
