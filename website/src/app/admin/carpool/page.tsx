import { CARPOOL_VEHICLES, formatCarpoolPhone } from "@/lib/carpool";
import { getAdminContext } from "@/lib/actions/auth";
import CarpoolCancelButton from "./CarpoolCancelButton";

interface RiderRow {
  id: number;
  vehicle_id: string;
  seat_no: number;
  name: string;
  phone: string;
  created_at: string;
}

export default async function AdminCarpoolPage() {
  const { supabase } = await getAdminContext();
  const { data, error } = await supabase
    .from("carpool_riders")
    .select("id, vehicle_id, seat_no, name, phone, created_at")
    .order("seat_no");

  const riders = (data ?? []) as RiderRow[];

  // 시트 탑승자 번호(carpool_boarded_contacts). 이름은 코드에, 번호는 DB에만 있다.
  const { data: contactData } = await supabase
    .from("carpool_boarded_contacts")
    .select("vehicle_id, name, phone");
  const contacts = (contactData ?? []) as { vehicle_id: string; name: string; phone: string }[];
  const totalOpen = CARPOOL_VEHICLES.reduce((sum, v) => sum + v.openSeats, 0);

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">목자르기 카풀</h1>
          <p className="mt-1 text-[var(--color-admin-muted)]">
            신청 {riders.length} / 빈자리 {totalOpen}석 ·{" "}
            <a href="/concert/mok-jareugi/carpool" target="_blank" className="underline">
              신청 페이지
            </a>
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          신청 명단을 불러오지 못했습니다: {error.message}
        </div>
      )}

      <div className="space-y-5">
        {CARPOOL_VEHICLES.map((vehicle) => {
          const list = riders.filter((r) => r.vehicle_id === vehicle.id);
          return (
            <section
              key={vehicle.id}
              className="rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold text-[var(--color-admin-text)]">{vehicle.name}</h2>
                <span className="text-sm text-[var(--color-admin-muted)]">
                  {vehicle.departurePlace} · {vehicle.departureTime ?? "시각 미정"} ·{" "}
                  {vehicle.sameDayReturn ? "당일 귀환" : "다음 날 귀환"} ·{" "}
                  <b className="text-[var(--color-admin-text)]">
                    {list.length}/{vehicle.openSeats}석
                  </b>
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[var(--color-admin-muted)]">시트 탑승자</p>
              <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                {vehicle.boarded.map((name) => {
                  const contact = contacts.find((c) => c.vehicle_id === vehicle.id && c.name === name);
                  return (
                    <li key={name}>
                      <b className="text-[var(--color-admin-text)]">{name}</b>{" "}
                      {contact ? (
                        <a href={`tel:${contact.phone}`} className="text-[var(--color-sky)]">
                          {formatCarpoolPhone(contact.phone)}
                        </a>
                      ) : (
                        <span className="text-[var(--color-admin-muted)]">번호 없음</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-sm font-semibold text-[var(--color-admin-muted)]">신청자</p>
              {list.length === 0 ? (
                <p className="mt-1 text-sm text-[var(--color-admin-muted)]">아직 신청자가 없습니다.</p>
              ) : (
                <ul className="mt-1 divide-y divide-[var(--color-admin-border)]">
                  {list.map((rider) => (
                    <li key={rider.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="min-w-0">
                        <span className="mr-2 text-sm text-[var(--color-admin-muted)]">{rider.seat_no}번</span>
                        <b className="text-[var(--color-admin-text)]">{rider.name}</b>{" "}
                        <a href={`tel:${rider.phone}`} className="ml-2 text-[var(--color-sky)]">
                          {formatCarpoolPhone(rider.phone)}
                        </a>
                      </span>
                      <CarpoolCancelButton id={rider.id} name={rider.name} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
