-- 국민 연대서명 전환: 지역·소속·이름 공개 여부 컬럼 추가, 이메일 선택화,
-- 기존 3필드 서명 데이터 전량 삭제(사전에 CSV/SQL 백업 완료 후 실행).

ALTER TABLE signatures
  ADD COLUMN region_top   TEXT,
  ADD COLUMN region_sub   TEXT,
  ADD COLUMN affiliation  TEXT,
  ADD COLUMN name_public  BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE signatures ALTER COLUMN email DROP NOT NULL;

-- ⚠️ 되돌릴 수 없음: 이 시점 이후 기존 서명 전량 소실. 백업 확인 필수.
TRUNCATE signatures RESTART IDENTITY;

ALTER TABLE signatures
  ALTER COLUMN region_top SET NOT NULL,
  ALTER COLUMN region_sub SET NOT NULL;

ALTER TABLE signatures
  ADD CONSTRAINT signatures_region_top_check CHECK (region_top IN (
    '서울특별시','부산광역시','대구광역시','인천광역시','광주광역시','대전광역시',
    '울산광역시','세종특별자치시','경기도','강원특별자치도','충청북도','충청남도',
    '전북특별자치도','전라남도','경상북도','경상남도','제주특별자치도','해외')),
  ADD CONSTRAINT signatures_affiliation_len  CHECK (affiliation IS NULL OR char_length(affiliation) <= 60);

DROP INDEX IF EXISTS idx_signatures_unique_normalized_email;
CREATE UNIQUE INDEX idx_signatures_unique_email
  ON signatures (lower(btrim(email)))
  WHERE email IS NOT NULL AND btrim(email) <> '';

CREATE INDEX idx_signatures_wall
  ON signatures (created_at DESC) WHERE name_public IS TRUE;
CREATE INDEX idx_signatures_region ON signatures (region_top);
