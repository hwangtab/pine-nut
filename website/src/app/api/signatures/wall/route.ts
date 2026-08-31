import type { NextRequest } from "next/server";
import {
  FETCH_SIGNATURE_WALL_ERROR_MESSAGE,
  IS_PRODUCTION,
} from "@/lib/signatures/api/config";
import {
  cachedPublicJsonResponse,
  missingSignatureServiceResponse,
  signatureApiErrorResponse,
} from "@/lib/signatures/api/responses";
import { fetchSignatureWall, type WallPage } from "@/lib/signatures/api/wall";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

const DEMO_WALL_PAGE: WallPage = {
  entries: [
    {
      name: "김도현",
      regionTop: "강원특별자치도",
      regionSub: "홍천군",
      createdAt: "2026-08-27T09:00:00Z",
      message: "잣나무숲은 한번 베면 90년을 되돌릴 수 없습니다. 다시 검토해주세요.",
    },
    {
      name: "박서연",
      regionTop: "서울특별시",
      regionSub: "마포구",
      createdAt: "2026-08-27T08:30:00Z",
      message: null,
    },
    {
      name: "이준호",
      regionTop: "경기도",
      regionSub: "수원시",
      createdAt: "2026-08-26T21:10:00Z",
      message: "전기가 필요하다면 다른 방법을 먼저 찾아야 합니다.",
    },
  ],
  nextCursor: null,
};

export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor");
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    if (IS_PRODUCTION) return missingSignatureServiceResponse();
    return cachedPublicJsonResponse(DEMO_WALL_PAGE);
  }

  try {
    return cachedPublicJsonResponse(await fetchSignatureWall(supabase, cursor));
  } catch (error) {
    return signatureApiErrorResponse(
      "Failed to fetch signature wall:",
      error,
      FETCH_SIGNATURE_WALL_ERROR_MESSAGE,
    );
  }
}
