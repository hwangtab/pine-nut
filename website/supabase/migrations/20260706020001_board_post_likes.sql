CREATE TABLE IF NOT EXISTS board_post_likes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
CREATE INDEX idx_board_post_likes_post ON board_post_likes (post_id);

-- 좋아요 수는 board_posts에 비정규화(공개 읽기). board_post_likes 행 자체는 본인만 열람
-- (누가 눌렀는지 anon 열거 노출 방지).
ALTER TABLE board_posts ADD COLUMN IF NOT EXISTS like_count INT NOT NULL DEFAULT 0;

-- INSERT/DELETE 시 board_posts.like_count 유지 (SECURITY DEFINER: 좋아요 누른 회원이
-- 남의 글 board_posts를 UPDATE할 권한이 없어도 트리거가 대신 갱신).
CREATE OR REPLACE FUNCTION board_post_likes_maintain_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE board_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE board_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER board_post_likes_count_ins AFTER INSERT ON board_post_likes
  FOR EACH ROW EXECUTE FUNCTION board_post_likes_maintain_count();
CREATE TRIGGER board_post_likes_count_del AFTER DELETE ON board_post_likes
  FOR EACH ROW EXECUTE FUNCTION board_post_likes_maintain_count();

ALTER TABLE board_post_likes ENABLE ROW LEVEL SECURITY;

-- 본인 좋아요 행만 열람(hasLikedPost용). 집계는 board_posts.like_count로 공개.
CREATE POLICY "board_post_likes_self_read" ON board_post_likes
  FOR SELECT TO authenticated USING (user_id = auth.uid());
-- 회원 본인만 추가/삭제
CREATE POLICY "board_post_likes_member_insert" ON board_post_likes
  FOR INSERT TO authenticated WITH CHECK (is_member() AND user_id = auth.uid());
CREATE POLICY "board_post_likes_member_delete" ON board_post_likes
  FOR DELETE TO authenticated USING (is_member() AND user_id = auth.uid());
