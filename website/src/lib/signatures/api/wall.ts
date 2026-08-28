import type { SupabaseClient } from "@supabase/supabase-js";
import { WALL_PAGE_SIZE } from "./config";

export interface WallEntry {
  name: string;
  regionTop: string;
  regionSub: string;
  createdAt: string;
}

export interface WallPage {
  entries: WallEntry[];
  nextCursor: string | null;
}

interface WallRow {
  name: string;
  region_top: string;
  region_sub: string;
  created_at: string;
}

// created_at은 Postgres timestamptz(마이크로초 정밀도)로, 같은 마이크로초에 두 서명이
// 동시에 들어와 커서 동률로 행이 누락/중복될 확률은 실질적으로 0에 가깝다. 설령
// 발생해도 명단 벽은 읽기 전용 표시일 뿐이라 최악의 경우 한 행이 한 페이지 어긋나는
// 정도다. idx_signatures_wall 인덱스가 (created_at DESC)만 커버하므로, id를 더한
// 복합 커서(.or() 튜플 비교)를 쓰면 이 인덱스만으로는 정렬을 보장할 수 없어 별도
// 인덱스가 필요해진다 — 이 비용을 들일 근거가 없다고 판단해 created_at 단일 커서로
// 간다.
function isParsableCursor(cursor: string): boolean {
  return !Number.isNaN(new Date(cursor).getTime());
}

export async function fetchSignatureWall(
  supabase: SupabaseClient,
  cursor: string | null,
): Promise<WallPage> {
  let query = supabase
    .from("signatures")
    .select("name, region_top, region_sub, created_at")
    .eq("name_public", true)
    .order("created_at", { ascending: false })
    .limit(WALL_PAGE_SIZE + 1);

  // 커서는 클라이언트가 조작 가능한 입력이다. 파싱 불가능한 값(예: 잘못된 딥링크,
  // 임의 변조)이 그대로 Postgres 비교에 들어가면 타입 캐스팅 에러로 500이 난다.
  // 명단 벽은 공개 읽기 전용 뷰라 이런 입력을 거부(400)하기보다 첫 페이지로
  // 폴백하는 편이 사용자 경험상 안전하다.
  if (cursor && isParsableCursor(cursor)) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data || []) as WallRow[];
  const hasMore = rows.length > WALL_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, WALL_PAGE_SIZE) : rows;

  return {
    entries: page.map((row) => ({
      name: row.name,
      regionTop: row.region_top,
      regionSub: row.region_sub,
      createdAt: row.created_at,
    })),
    nextCursor: hasMore ? page[page.length - 1].created_at : null,
  };
}
