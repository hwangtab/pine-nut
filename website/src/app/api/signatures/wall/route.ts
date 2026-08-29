import { NextRequest, NextResponse } from "next/server";
import {
  FETCH_SIGNATURE_WALL_ERROR_MESSAGE,
  IS_PRODUCTION,
} from "@/lib/signatures/api/config";
import {
  missingSignatureServiceResponse,
  signatureApiErrorResponse,
} from "@/lib/signatures/api/responses";
import { fetchSignatureWall, type WallPage } from "@/lib/signatures/api/wall";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

const DEMO_WALL_PAGE: WallPage = {
  entries: [
    { name: "김도현", regionTop: "강원특별자치도", regionSub: "홍천군", createdAt: "2026-08-27T09:00:00Z" },
    { name: "박서연", regionTop: "서울특별시", regionSub: "마포구", createdAt: "2026-08-27T08:30:00Z" },
    { name: "이준호", regionTop: "경기도", regionSub: "수원시", createdAt: "2026-08-26T21:10:00Z" },
  ],
  nextCursor: null,
};

export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor");
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    if (IS_PRODUCTION) return missingSignatureServiceResponse();
    return NextResponse.json(DEMO_WALL_PAGE);
  }

  try {
    return NextResponse.json(await fetchSignatureWall(supabase, cursor));
  } catch (error) {
    return signatureApiErrorResponse(
      "Failed to fetch signature wall:",
      error,
      FETCH_SIGNATURE_WALL_ERROR_MESSAGE,
    );
  }
}
