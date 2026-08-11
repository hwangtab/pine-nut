-- 과거 2025 실시계획인가 고시(제2025-151호) 관련 표기는 발령 당시 명칭 '산업통상자원부'로 되돌림.
-- 단, 2026.8.5 김성환 기후에너지환경부 장관 면담 항목(현재 명칭)은 유지.
-- (선행 빈 마이그레이션 20260811040135 대체분)

update public.timeline_events
set title = replace(title, '기후에너지환경부', '산업통상자원부'),
    description = replace(description, '기후에너지환경부', '산업통상자원부')
where title not like '김성환%'
  and (title like '%기후에너지환경부%' or description like '%기후에너지환경부%');

update public.news
set title = replace(title, '기후에너지환경부', '산업통상자원부'),
    summary = replace(summary, '기후에너지환경부', '산업통상자원부'),
    content = replace(content, '기후에너지환경부', '산업통상자원부')
where title like '%기후에너지환경부%'
   or summary like '%기후에너지환경부%'
   or content like '%기후에너지환경부%';
