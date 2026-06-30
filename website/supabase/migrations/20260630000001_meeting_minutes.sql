-- ==================== MEETINGS (회의록) ====================
CREATE TABLE IF NOT EXISTS meetings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  meeting_no INT,
  meeting_date DATE,
  meeting_time TEXT,
  location TEXT,
  format TEXT CHECK (format IN ('online', 'offline', 'hybrid')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed')),
  purpose TEXT,
  notes TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS meeting_attendees (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meeting_agendas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  discussion TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meeting_decisions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meeting_action_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  owner TEXT,
  task TEXT NOT NULL,
  due_text TEXT,
  is_done BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meeting_attachments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== INDEXES ====================
CREATE INDEX idx_meetings_status ON meetings (status);
CREATE INDEX idx_meetings_date ON meetings (meeting_date DESC);
CREATE INDEX idx_meeting_attendees_mid ON meeting_attendees (meeting_id, sort_order);
CREATE INDEX idx_meeting_agendas_mid ON meeting_agendas (meeting_id, sort_order);
CREATE INDEX idx_meeting_decisions_mid ON meeting_decisions (meeting_id, sort_order);
CREATE INDEX idx_meeting_action_items_mid ON meeting_action_items (meeting_id, sort_order);
CREATE INDEX idx_meeting_attachments_mid ON meeting_attachments (meeting_id);

-- ==================== RLS (authenticated full access) ====================
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meetings_auth_all" ON meetings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "meeting_attendees_auth_all" ON meeting_attendees
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "meeting_agendas_auth_all" ON meeting_agendas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "meeting_decisions_auth_all" ON meeting_decisions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "meeting_action_items_auth_all" ON meeting_action_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "meeting_attachments_auth_all" ON meeting_attachments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==================== STORAGE: meeting-files (private) ====================
INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting-files', 'meeting-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "meeting_files_auth_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'meeting-files');
CREATE POLICY "meeting_files_auth_select" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'meeting-files');
CREATE POLICY "meeting_files_auth_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'meeting-files');
