ALTER TABLE board_posts ADD COLUMN category TEXT NOT NULL DEFAULT '자유'
  CHECK (category IN ('자유','질문','제안','후기'));
CREATE INDEX idx_board_posts_category ON board_posts (category) WHERE NOT is_deleted;
