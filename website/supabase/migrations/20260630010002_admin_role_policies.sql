-- news: 공개 읽기 유지, 쓰기는 editor+, 관리자 전체읽기(삭제행 포함)
DROP POLICY IF EXISTS "Admin full access news" ON news;
CREATE POLICY "news_admin_read" ON news
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "news_editor_insert" ON news
  FOR INSERT TO authenticated WITH CHECK (admin_can_edit());
CREATE POLICY "news_editor_update" ON news
  FOR UPDATE TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());
CREATE POLICY "news_editor_delete" ON news
  FOR DELETE TO authenticated USING (admin_can_edit());

-- timeline_events
DROP POLICY IF EXISTS "Admin full access timeline" ON timeline_events;
CREATE POLICY "timeline_admin_read" ON timeline_events
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "timeline_editor_insert" ON timeline_events
  FOR INSERT TO authenticated WITH CHECK (admin_can_edit());
CREATE POLICY "timeline_editor_update" ON timeline_events
  FOR UPDATE TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());
CREATE POLICY "timeline_editor_delete" ON timeline_events
  FOR DELETE TO authenticated USING (admin_can_edit());

-- page_content: 공개 읽기 유지, 쓰기 editor+
DROP POLICY IF EXISTS "page_content_auth_insert" ON page_content;
DROP POLICY IF EXISTS "page_content_auth_update" ON page_content;
DROP POLICY IF EXISTS "page_content_auth_delete" ON page_content;
CREATE POLICY "page_content_editor_insert" ON page_content
  FOR INSERT TO authenticated WITH CHECK (admin_can_edit());
CREATE POLICY "page_content_editor_update" ON page_content
  FOR UPDATE TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());
CREATE POLICY "page_content_editor_delete" ON page_content
  FOR DELETE TO authenticated USING (admin_can_edit());

-- audit_log: 읽기 active admin, 삽입 active admin (기존 authenticated→역할)
DROP POLICY IF EXISTS "Authenticated read audit" ON audit_log;
DROP POLICY IF EXISTS "Authenticated insert audit" ON audit_log;
CREATE POLICY "audit_admin_read" ON audit_log
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "audit_admin_insert" ON audit_log
  FOR INSERT TO authenticated WITH CHECK (is_active_admin());

-- meetings + 하위: 읽기 active admin, 쓰기 editor+
DROP POLICY IF EXISTS "meetings_auth_all" ON meetings;
CREATE POLICY "meetings_admin_read" ON meetings
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "meetings_editor_write" ON meetings
  FOR ALL TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());

DROP POLICY IF EXISTS "meeting_attendees_auth_all" ON meeting_attendees;
CREATE POLICY "meeting_attendees_admin_read" ON meeting_attendees
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "meeting_attendees_editor_write" ON meeting_attendees
  FOR ALL TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());

DROP POLICY IF EXISTS "meeting_agendas_auth_all" ON meeting_agendas;
CREATE POLICY "meeting_agendas_admin_read" ON meeting_agendas
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "meeting_agendas_editor_write" ON meeting_agendas
  FOR ALL TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());

DROP POLICY IF EXISTS "meeting_decisions_auth_all" ON meeting_decisions;
CREATE POLICY "meeting_decisions_admin_read" ON meeting_decisions
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "meeting_decisions_editor_write" ON meeting_decisions
  FOR ALL TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());

DROP POLICY IF EXISTS "meeting_action_items_auth_all" ON meeting_action_items;
CREATE POLICY "meeting_action_items_admin_read" ON meeting_action_items
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "meeting_action_items_editor_write" ON meeting_action_items
  FOR ALL TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());

DROP POLICY IF EXISTS "meeting_attachments_auth_all" ON meeting_attachments;
CREATE POLICY "meeting_attachments_admin_read" ON meeting_attachments
  FOR SELECT TO authenticated USING (is_active_admin());
CREATE POLICY "meeting_attachments_editor_write" ON meeting_attachments
  FOR ALL TO authenticated USING (admin_can_edit()) WITH CHECK (admin_can_edit());

-- storage: meeting-files 읽기/쓰기를 역할 기반으로 강화
DROP POLICY IF EXISTS "meeting_files_auth_select" ON storage.objects;
DROP POLICY IF EXISTS "meeting_files_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "meeting_files_auth_delete" ON storage.objects;
CREATE POLICY "meeting_files_admin_select" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'meeting-files' AND is_active_admin());
CREATE POLICY "meeting_files_editor_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'meeting-files' AND admin_can_edit());
CREATE POLICY "meeting_files_editor_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'meeting-files' AND admin_can_edit());

-- images 버킷: 쓰기를 editor+로 (public read 유지)
DROP POLICY IF EXISTS "Authenticated upload images" ON storage.objects;
CREATE POLICY "images_editor_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images' AND admin_can_edit());

-- 적용 후 수동 확인용 (CLI/대시보드):
-- SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies
--   WHERE schemaname IN ('public','storage')
--   AND (qual = 'true' OR with_check = 'true')
--   AND cmd IN ('INSERT','UPDATE','DELETE','ALL');
-- → 결과가 공개 SELECT 외에 쓰기 정책으로 남으면 권한 구멍.
