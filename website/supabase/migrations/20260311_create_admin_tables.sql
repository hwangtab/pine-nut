-- ==================== NEWS TABLE ====================
CREATE TABLE IF NOT EXISTS news (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('공지', '집회', '언론보도', '연대')),
  source_url TEXT NOT NULL DEFAULT '',
  source_name TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_slug ON news (slug) WHERE NOT is_deleted;
CREATE INDEX idx_news_date ON news (date DESC) WHERE NOT is_deleted;

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read news" ON news
  FOR SELECT TO anon
  USING (NOT is_deleted);

CREATE POLICY "Admin full access news" ON news
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==================== TIMELINE_EVENTS TABLE ====================
CREATE TABLE IF NOT EXISTS timeline_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date TEXT NOT NULL,
  year INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('회의', '집회', '법률', '연대', '기타')),
  image_url TEXT,
  image_alt TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_sort ON timeline_events (sort_order) WHERE NOT is_deleted;

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read timeline" ON timeline_events
  FOR SELECT TO anon
  USING (NOT is_deleted);

CREATE POLICY "Admin full access timeline" ON timeline_events
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==================== updated_at TRIGGER ====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER timeline_updated_at
  BEFORE UPDATE ON timeline_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
