-- 언론사 핫링크 이미지 → 자체 스토리지 미러링
-- 홈·소식·연혁의 사진이 언론사 서버(ohmynews·pressian·newsis) 상태에 따라
-- 느리게 뜨거나 안 뜨는 문제의 근본 해결. 원본 파일은 images/press/에 업로드 완료.
update news set thumbnail_url =
  'https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/'
  || lower(regexp_replace(thumbnail_url, '^.*/', ''))
where thumbnail_url ~ 'ohmynews|pressian|newsis';

update timeline_events set image_url =
  'https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/'
  || lower(regexp_replace(image_url, '^.*/', ''))
where image_url ~ 'ohmynews|pressian|newsis';

insert into audit_log (table_name, record_id, action, user_email, entity_key, payload, created_at)
values ('news+timeline_events', 0, 'bulk_update', 'contact@kosmart.org',
  '언론사 핫링크 이미지 → 자체 스토리지(images/press/) 미러링',
  jsonb_build_object('reason', '언론사 서버 지연·차단으로 사진 미표시 방지'), now());
