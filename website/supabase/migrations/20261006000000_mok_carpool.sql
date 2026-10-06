-- 목자르기(10/10) 카풀 신청. 차량 정보는 코드(src/lib/carpool.ts)에 있고 여기엔
-- 신청자만 쌓인다. 쓰기는 /api/carpool(service role)만 하고, 읽기·삭제는 관리자만.

CREATE TABLE carpool_riders (
  id          BIGSERIAL PRIMARY KEY,
  vehicle_id  TEXT NOT NULL,
  seat_no     SMALLINT NOT NULL CHECK (seat_no BETWEEN 1 AND 10),
  name        TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 30),
  phone       TEXT NOT NULL CHECK (phone ~ '^01[016789][0-9]{7,8}$'),
  ip_hash     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- 두 사람이 같은 자리를 동시에 눌러도 한 명만 들어간다
  CONSTRAINT carpool_riders_seat_unique UNIQUE (vehicle_id, seat_no),
  -- 한 사람은 한 자리만
  CONSTRAINT carpool_riders_phone_unique UNIQUE (phone)
);

CREATE INDEX idx_carpool_riders_ip_recent ON carpool_riders (ip_hash, created_at DESC);

ALTER TABLE carpool_riders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carpool_riders_admin_select" ON carpool_riders
  FOR SELECT TO authenticated USING (is_active_admin());

CREATE POLICY "carpool_riders_editor_delete" ON carpool_riders
  FOR DELETE TO authenticated USING (admin_can_edit());
