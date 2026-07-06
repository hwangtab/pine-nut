-- ==================== board_post_images ====================
CREATE TABLE IF NOT EXISTS board_post_images (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_board_post_images_post ON board_post_images (post_id, sort_order);

ALTER TABLE board_post_images ENABLE ROW LEVEL SECURITY;

-- 공개 읽기
CREATE POLICY "board_post_images_public_read" ON board_post_images
  FOR SELECT TO anon, authenticated USING (true);
-- 글 작성자 또는 기획단만 추가/삭제
CREATE POLICY "board_post_images_author_insert" ON board_post_images
  FOR INSERT TO authenticated WITH CHECK (
    is_member() AND (
      EXISTS (SELECT 1 FROM board_posts p WHERE p.id = post_id AND p.author_user_id = auth.uid())
      OR admin_can_edit()
    )
  );
CREATE POLICY "board_post_images_author_delete" ON board_post_images
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM board_posts p WHERE p.id = post_id AND p.author_user_id = auth.uid())
    OR admin_can_edit()
  );

-- ==================== board-images 공개 버킷 ====================
INSERT INTO storage.buckets (id, name, public)
VALUES ('board-images', 'board-images', true)
ON CONFLICT (id) DO NOTHING;

-- 공개 읽기
CREATE POLICY "board_images_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'board-images');
-- 회원 업로드
CREATE POLICY "board_images_member_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'board-images' AND is_member());
-- 업로더 본인 또는 기획단 삭제 (owner = 업로드한 auth.uid())
CREATE POLICY "board_images_owner_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'board-images' AND (owner = auth.uid() OR admin_can_edit()));
