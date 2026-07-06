CREATE TABLE IF NOT EXISTS board_post_likes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
CREATE INDEX idx_board_post_likes_post ON board_post_likes (post_id);

ALTER TABLE board_post_likes ENABLE ROW LEVEL SECURITY;

-- 집계용 공개 읽기
CREATE POLICY "board_post_likes_public_read" ON board_post_likes
  FOR SELECT TO anon, authenticated USING (true);
-- 회원 본인만 추가/삭제
CREATE POLICY "board_post_likes_member_insert" ON board_post_likes
  FOR INSERT TO authenticated WITH CHECK (is_member() AND user_id = auth.uid());
CREATE POLICY "board_post_likes_member_delete" ON board_post_likes
  FOR DELETE TO authenticated USING (is_member() AND user_id = auth.uid());
