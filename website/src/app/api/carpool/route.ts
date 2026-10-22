import { NextRequest, NextResponse } from "next/server";
import {
  CARPOOL_CLOSE_AT,
  CARPOOL_VEHICLES,
  findBoardedVehicle,
  findCarpoolVehicle,
  normalizeCarpoolName,
  normalizeCarpoolPhone,
} from "@/lib/carpool";
import { getClientIp, hashIp } from "@/lib/signatures/api/request";
import { jsonErrorResponse } from "@/lib/signatures/api/responses";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export const dynamic = "force-dynamic";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const SERVICE_UNAVAILABLE = "지금은 신청을 받을 수 없습니다. 잠시 뒤 다시 시도해주세요.";
const PHONE_TAKEN = "이 번호로 이미 자리가 잡혀 있습니다. 변경은 문의 연락처로 알려주세요.";

const isClosed = () => Date.now() >= CARPOOL_CLOSE_AT.getTime();

/**
 * 차량별로 이미 찬 좌석 번호와 신청자 이름. 연락처는 내보내지 않는다.
 * 마감 뒤에는 DB 를 읽지 않고 빈 목록만 돌려준다 — 신청자 이름은 자리를 고르는
 * 사람에게 보여주려고 공개한 것이라, 고를 자리가 없어지면 공개할 이유도 없다.
 */
export async function GET() {
  if (isClosed()) {
    return NextResponse.json(
      { taken: {}, riders: {}, closed: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) return jsonErrorResponse(SERVICE_UNAVAILABLE, 503);

  const { data, error } = await supabase
    .from("carpool_riders")
    .select("vehicle_id, seat_no, name")
    .order("created_at");
  if (error) {
    console.error("carpool: fetch failed", error.message);
    return jsonErrorResponse(SERVICE_UNAVAILABLE, 500);
  }

  const taken: Record<string, number[]> = {};
  const riders: Record<string, string[]> = {};
  for (const vehicle of CARPOOL_VEHICLES) {
    taken[vehicle.id] = [];
    riders[vehicle.id] = [];
  }
  for (const row of data ?? []) {
    taken[row.vehicle_id]?.push(row.seat_no);
    riders[row.vehicle_id]?.push(row.name);
  }

  return NextResponse.json(
    { taken, riders, closed: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  if (isClosed()) {
    return jsonErrorResponse("카풀 신청이 마감되었습니다.", 410);
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    // JSON 으로는 맞아도 객체가 아니면(null, 숫자, 배열) 아래 필드 접근이 500 을 낸다.
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return jsonErrorResponse("잘못된 요청입니다.", 400);
  }

  const vehicle = typeof body.vehicleId === "string" ? findCarpoolVehicle(body.vehicleId) : undefined;
  const seatNo = typeof body.seatNo === "number" ? body.seatNo : NaN;
  const name = typeof body.name === "string" ? normalizeCarpoolName(body.name) : "";
  const phone = typeof body.phone === "string" ? normalizeCarpoolPhone(body.phone) : null;

  if (!vehicle || !Number.isInteger(seatNo) || seatNo < 1 || seatNo > vehicle.openSeats) {
    return jsonErrorResponse("좌석을 다시 골라주세요.", 400);
  }
  if (!name || name.length > 30) return jsonErrorResponse("이름을 확인해주세요.", 400);
  if (!phone) return jsonErrorResponse("휴대전화 번호를 확인해주세요.", 400);
  if (body.consent !== true) return jsonErrorResponse("개인정보 수집·이용에 동의해주세요.", 400);

  const boardedVehicle = findBoardedVehicle(name);
  if (boardedVehicle) {
    return jsonErrorResponse(
      `${name}님은 이미 ${boardedVehicle.name}에 타기로 되어 있어요. 따로 신청하지 않으셔도 됩니다.`,
      409,
    );
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) return jsonErrorResponse(SERVICE_UNAVAILABLE, 503);

  // 시트에서 이미 자리가 정해진 사람이 다른 이름으로 또 신청하는 것을 번호로 막는다.
  const { data: boardedContact, error: boardedError } = await supabase
    .from("carpool_boarded_contacts")
    .select("vehicle_id")
    .eq("phone", phone)
    .maybeSingle();
  if (boardedError) {
    console.error("carpool: boarded check failed", boardedError.message);
    return jsonErrorResponse(SERVICE_UNAVAILABLE, 500);
  }
  // 어느 차량인지는 응답에 싣지 않는다 — 실으면 번호를 넣어 보는 것만으로 공개된
  // 탑승자 이름과 번호를 짝지을 수 있다. 신청자 번호 중복(23505)과 같은 문구를 쓴다.
  if (boardedContact) {
    return jsonErrorResponse(PHONE_TAKEN, 409);
  }

  const ipHash = hashIp(getClientIp(request));
  const { count, error: rateError } = await supabase
    .from("carpool_riders")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString());
  if (rateError) {
    console.error("carpool: rate check failed", rateError.message);
    return jsonErrorResponse(SERVICE_UNAVAILABLE, 500);
  }
  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return jsonErrorResponse("잠시 뒤 다시 시도해주세요.", 429);
  }

  // 좌석 번호의 UNIQUE 제약은 같은 자리 두 명만 막는다. openSeats 를 줄이면 그 범위
  // 밖 번호에 이미 앉은 사람이 남아, 범위 안 빈 번호로 한 명이 더 들어올 수 있다.
  // 그래서 차량 인원도 따로 센다.
  const { count: vehicleCount, error: vehicleCountError } = await supabase
    .from("carpool_riders")
    .select("id", { count: "exact", head: true })
    .eq("vehicle_id", vehicle.id);
  if (vehicleCountError) {
    console.error("carpool: vehicle count failed", vehicleCountError.message);
    return jsonErrorResponse(SERVICE_UNAVAILABLE, 500);
  }
  if ((vehicleCount ?? 0) >= vehicle.openSeats) {
    return seatTakenResponse("이 차량은 자리가 다 찼습니다. 다른 차량을 골라주세요.");
  }

  const { error } = await supabase.from("carpool_riders").insert({
    vehicle_id: vehicle.id,
    seat_no: seatNo,
    name,
    phone,
    ip_hash: ipHash,
  });

  if (error) {
    if (error.code === "23505") {
      return error.message.includes("phone")
        ? jsonErrorResponse(PHONE_TAKEN, 409)
        : seatTakenResponse("방금 다른 분이 이 자리를 신청했습니다. 다른 자리를 골라주세요.");
    }
    console.error("carpool: insert failed", error.message);
    return jsonErrorResponse(SERVICE_UNAVAILABLE, 500);
  }

  return NextResponse.json({ success: true });
}

/**
 * 자리를 놓친 409. 같은 409 를 이름·번호 중복에도 쓰므로, 클라이언트가 고른 자리를
 * 풀어야 하는 경우인지 알 수 있게 code 를 붙인다.
 */
function seatTakenResponse(error: string) {
  return NextResponse.json({ error, code: "seat_taken" }, { status: 409 });
}
