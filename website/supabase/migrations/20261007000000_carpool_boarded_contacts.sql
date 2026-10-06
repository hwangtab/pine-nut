-- 시트에서 미리 자리가 정해진 탑승자의 연락처. 이름·차량은 코드(src/lib/carpool.ts)에
-- 있지만 번호는 저장소에 올리지 않으려고 여기에만 둔다. 데이터는 마이그레이션이 아니라
-- 관리자가 직접 넣는다.
-- 쓰임: ① /admin/carpool 명단에 번호 표시 ② 이 번호로 카풀을 또 신청하면 /api/carpool 이 막는다.

CREATE TABLE carpool_boarded_contacts (
  id          BIGSERIAL PRIMARY KEY,
  vehicle_id  TEXT NOT NULL,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL UNIQUE CHECK (phone ~ '^01[016789][0-9]{7,8}$'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE carpool_boarded_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carpool_boarded_contacts_admin_select" ON carpool_boarded_contacts
  FOR SELECT TO authenticated USING (is_active_admin());
