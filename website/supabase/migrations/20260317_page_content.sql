-- page_content: stores admin-editable content overrides per content_key
CREATE TABLE IF NOT EXISTS page_content (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  content_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL DEFAULT 'text',  -- text, richtext, image, list, section
  value TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}',
  page TEXT NOT NULL,
  section TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT NOT NULL DEFAULT ''
);

-- Index for fast page-level queries
CREATE INDEX idx_page_content_page ON page_content (page);

-- RLS: public read, authenticated write
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_content_public_read"
  ON page_content FOR SELECT
  USING (true);

CREATE POLICY "page_content_auth_insert"
  ON page_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "page_content_auth_update"
  ON page_content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "page_content_auth_delete"
  ON page_content FOR DELETE
  TO authenticated
  USING (true);
