import { NextRequest, NextResponse } from "next/server";
import {
  CARPOOL_CLOSE_AT,
  CARPOOL_VEHICLES,
  findBoardedVehicle,
  findCarpoolVehicle,
  normalizeCarpoolPhone,
} from "@/lib/carpool";
import { getClientIp, hashIp } from "@/lib/signatures/api/request";
import { jsonErrorResponse } from "@/lib/signatures/api/responses";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export const dynamic = "force-dynamic";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const SERVICE_UNAVAILABLE = "지금은 신청을 받을 수 없습니다. 잠시 뒤 다시 시도해주세요.";

/** 차량별로 이미 찬 좌석 번호와 신청자 이름. 연락처는 내보내지 않는다. */
export async function GET() {
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
    { taken, riders, closed: Date.now() >= CARPOOL_CLOSE_AT.getTime() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  if (Date.now() >= CARPOOL_CLOSE_AT.getTime()) {
    return jsonErrorResponse("카풀 신청이 마감되었습니다.", 410);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonErrorResponse("잘못된 요청입니다.", 400);
  }

  const vehicle = typeof body.vehicleId === "string" ? findCarpoolVehicle(body.vehicleId) : undefined;
  const seatNo = typeof body.seatNo === "number" ? body.seatNo : NaN;
  const name = typeof body.name === "string" ? body.name.trim() : "";
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
        ? jsonErrorResponse("이 번호로 이미 신청하셨습니다. 변경은 문의 연락처로 알려주세요.", 409)
        : jsonErrorResponse("방금 다른 분이 이 자리를 신청했습니다. 다른 자리를 골라주세요.", 409);
    }
    console.error("carpool: insert failed", error.message);
    return jsonErrorResponse(SERVICE_UNAVAILABLE, 500);
  }

  return NextResponse.json({ success: true });
}
