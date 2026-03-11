-- ==================== STORAGE: IMAGES BUCKET ====================
-- Public 버킷 생성 (이미지 업로드용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'images');

-- 누구나 읽기 가능 (public 버킷)
CREATE POLICY "Public read images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'images');
