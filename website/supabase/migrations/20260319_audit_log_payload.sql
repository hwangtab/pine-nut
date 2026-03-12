ALTER TABLE audit_log
ADD COLUMN IF NOT EXISTS entity_key TEXT;

ALTER TABLE audit_log
ADD COLUMN IF NOT EXISTS payload JSONB;

CREATE INDEX IF NOT EXISTS idx_audit_log_entity_key
ON audit_log (entity_key);
