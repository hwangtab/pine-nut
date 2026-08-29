-- 국민 연대서명 전환: 지역·소속·이름 공개 여부 컬럼 추가, 이메일 선택화.
-- 기존 서명(65건, 2026-03-10~08-28)은 보존한다 — 백업 뒤 폐기하려던 원래 계획을
-- 실제 건수·서명 시점을 확인한 뒤 사용자가 보존으로 변경했다.

ALTER TABLE signatures
  ADD COLUMN region_top   TEXT,
  ADD COLUMN region_sub   TEXT,
  ADD COLUMN affiliation  TEXT,
  ADD COLUMN name_public  BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE signatures ALTER COLUMN email DROP NOT NULL;

-- 기존 서명은 지역을 수집하지 않았다 — 18개 시·도 중 어느 것을 넣어도 거짓
-- 데이터가 된다. NOT NULL을 걸기 전에 '미상' 센티넬로 백필한다(아래 CHECK
-- 제약에 '미상'을 허용값으로 추가한 이유도 이것이다). region_sub는 세종특별
-- 자치시(시·군·구 없음)와 같은 형태로 빈 문자열을 쓴다.
UPDATE signatures SET region_top = '미상', region_sub = '' WHERE region_top IS NULL;

ALTER TABLE signatures
  ALTER COLUMN region_top SET NOT NULL,
  ALTER COLUMN region_sub SET NOT NULL;

-- 스키마 선적용 → 코드 후배포 사이의 창에서, 아직 살아 있는 구 코드의 INSERT가
-- 23502로 실패하지 않게 한다. 그 창에 들어온 서명은 레거시 65건과 같은
-- '미상' 취급을 받는다(집계·동의율 분모에서 제외) — 실패보다 낫다.
-- 신규 코드 배포 확인 후 별도 마이그레이션으로 DROP DEFAULT 한다.
ALTER TABLE signatures
  ALTER COLUMN region_top SET DEFAULT '미상',
  ALTER COLUMN region_sub SET DEFAULT '';

ALTER TABLE signatures
  -- '미상': 2026-08-28 이전 서명 65건은 지역을 수집하지 않았다. 폼은 이 값을
  -- 만들 수 없다(src/lib/regions.ts의 isValidRegionPair가 거부) — 레거시 백필
  -- 전용 값이다.
  ADD CONSTRAINT signatures_region_top_check CHECK (region_top IN (
    '서울특별시','부산광역시','대구광역시','인천광역시','광주광역시','대전광역시',
    '울산광역시','세종특별자치시','경기도','강원특별자치도','충청북도','충청남도',
    '전북특별자치도','전라남도','경상북도','경상남도','제주특별자치도','해외','미상')),
  ADD CONSTRAINT signatures_affiliation_len  CHECK (affiliation IS NULL OR char_length(affiliation) <= 60);

DROP INDEX IF EXISTS idx_signatures_unique_normalized_email;
CREATE UNIQUE INDEX idx_signatures_unique_email
  ON signatures (lower(btrim(email)))
  WHERE email IS NOT NULL AND btrim(email) <> '';

-- (created_at DESC, id DESC): 명단 벽 커서 페이지네이션이 튜플 비교
-- (created_at < C) OR (created_at = C AND id < I)로 동률을 깬다. id를 함께
-- 인덱싱해야 동일 트랜잭션에서 일괄 INSERT된 행들(종이 서명 일괄 등록 등, 같은
-- created_at을 갖는 행 다수)도 인덱스 스캔만으로 정렬·페이지 경계가 안정적이다.
CREATE INDEX idx_signatures_wall
  ON signatures (created_at DESC, id DESC) WHERE name_public IS TRUE;
CREATE INDEX idx_signatures_region ON signatures (region_top);

-- 참여 지역 수 집계를 DB로 내린다. supabase/config.toml의 max_rows(1000)에 걸려
-- 서명이 1000건을 넘으면 select("region_top") 전체 스캔이 조용히 앞쪽 1000행만
-- 반환하고, 그 뒤로는 regionCount가 절대 늘지 않는 문제를 막기 위함.
-- idx_signatures_region이 있어 count(distinct region_top) 비용은 낮다.
-- region_top <> '미상': 지역을 수집하지 않은 레거시 65건이 "참여 지역 N곳"을
-- 실제보다 1 부풀리지 않도록 집계에서 제외한다.
CREATE OR REPLACE FUNCTION signature_region_count()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(DISTINCT region_top)::int FROM signatures WHERE region_top <> '미상'
$$;
REVOKE ALL ON FUNCTION signature_region_count() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION signature_region_count() TO service_role;
