-- Add bulk_update to audit_log action CHECK constraint
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_action_check;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_action_check CHECK (action IN ('create', 'update', 'delete', 'restore', 'bulk_update'));
