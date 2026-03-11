-- ==================== AUDIT LOG TABLE ====================
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id BIGINT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'restore')),
  user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_created ON audit_log (created_at DESC);
CREATE INDEX idx_audit_log_table ON audit_log (table_name, record_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자만 접근 가능
CREATE POLICY "Authenticated read audit" ON audit_log
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated insert audit" ON audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);
