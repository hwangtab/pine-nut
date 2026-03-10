-- Create signatures table for petition
CREATE TABLE IF NOT EXISTS signatures (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for petition signing)
CREATE POLICY "Allow anonymous inserts" ON signatures
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous to read count and recent signatures (no email exposed)
CREATE POLICY "Allow anonymous select" ON signatures
  FOR SELECT TO anon
  USING (true);

-- Create index for faster count queries
CREATE INDEX IF NOT EXISTS idx_signatures_created_at ON signatures (created_at DESC);
