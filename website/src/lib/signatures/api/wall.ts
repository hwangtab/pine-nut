import type { SupabaseClient } from "@supabase/supabase-js";
import { WALL_PAGE_SIZE } from "./config";

export interface WallEntry {
  name: string;
  regionTop: string;
  regionSub: string;
  createdAt: string;
  /** 제안 한마디. 선택 입력이라 비워둔 서명이 많다 — 빈 값은 null로 정규화한다. */
  message: string | null;
}

export interface WallPage {
  entries: WallEntry[];
  nextCursor: string | null;
}

interface WallRow {
  id: number;
  name: string;
  region_top: string;
  region_sub: string;
  created_at: string;
  message: string | null;
}

const CURSOR_SEPARATOR = "|";

// created_at은 DEFAULT NOW()이고 Postgres에서 now()는 "트랜잭션 시작 시각"으로
// 고정된다 — 즉 한 트랜잭션에서 여러 행을 INSERT하면(종이 서명 일괄 등록 등) 그
// 행 전부가 완전히 동일한 created_at을 갖는다. created_at 단일 커서로
// `.lt("created_at", cursor)`만 쓰면 페이지 경계가 그 블록 안에 떨어지는 순간
// 블록의 나머지가 통째로 건너뛰어져 명단에서 조용히 사라진다. 그래서 커서를
// `created_at,id` 튜플로 만들고 `(created_at < C) OR (created_at = C AND id < I)`로
// 동률을 id로 깬다. id는 이 파일 밖으로 나가지 않는다 — 커서 문자열 안에만 있고
// WallEntry에는 없다. idx_signatures_wall이 (created_at DESC, id DESC)를 커버하므로
// 이 정렬·필터 모두 인덱스 스캔으로 처리된다.
//
// created_at 파트는 new Date()로 느슨하게 파싱하지 않는다 — `?cursor=1`이
// JS에서는 2001-01-01로 파싱되지만 Postgres timestamptz 캐스팅은 거부하고,
// `2026-08-27`(날짜만)은 JS는 UTC 자정으로 읽지만 Postgres는 세션 타임존으로
// 읽어 페이지 경계가 몰래 어긋난다. 엄격한 ISO-8601(시각+타임존 포함) 정규식으로
// 형식을 먼저 못박는다.
//
// 검증에 통과한 뒤에도 원본 문자열을 그대로 Postgres에 넘긴다 — `new
// Date().toISOString()`으로 재직렬화하지 않는다. Postgres timestamptz는
// 마이크로초 정밀도인데 JS Date는 밀리초까지만 표현하므로, toISOString()
// 재직렬화는 예컨대 "09:00:00.123456"을 "09:00:00.123"으로 잘라낸다. 이 커서는
// 동률 튜플의 `created_at.eq.C` 비교에 직접 쓰이는데, 잘린 값은 실제 DB 값과
// 더 이상 같지 않아 동률 분기가 항상 실패하고, `created_at.lt.C`(더 작아진 값)
// 비교도 절단된 구간(.123000~.123456) 사이의 실제 행들을 건너뛴다 — 복합
// 커서를 도입한 이유 자체를 무력화하는 결과다. `new Date()`는 형식이 이미
// 정규식으로 못박힌 뒤 달력상 유효성(13월·99시 등)만 한 번 더 거르는 용도로만
// 쓰고, 그 결과값은 버린다.
const ISO_8601_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

interface WallCursor {
  createdAt: string;
  id: number;
}

function encodeCursor(row: WallRow): string {
  return `${row.created_at}${CURSOR_SEPARATOR}${row.id}`;
}

function parseCursor(raw: string): WallCursor | null {
  const separatorIndex = raw.lastIndexOf(CURSOR_SEPARATOR);
  if (separatorIndex === -1) return null;

  const createdAtPart = raw.slice(0, separatorIndex);
  const idPart = raw.slice(separatorIndex + 1);

  if (!ISO_8601_PATTERN.test(createdAtPart)) return null;
  if (Number.isNaN(new Date(createdAtPart).getTime())) return null;

  if (!/^\d+$/.test(idPart)) return null;
  const id = Number(idPart);
  if (!Number.isSafeInteger(id)) return null;

  return { createdAt: createdAtPart, id };
}

export async function fetchSignatureWall(
  supabase: SupabaseClient,
  cursor: string | null,
): Promise<WallPage> {
  let query = supabase
    .from("signatures")
    .select("id, name, region_top, region_sub, created_at, message")
    .eq("name_public", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(WALL_PAGE_SIZE + 1);

  // 커서는 클라이언트가 조작 가능한 입력이다. 파싱 실패(형식 오류·변조된 값)는
  // 400으로 거부하지 않고 첫 페이지로 폴백한다 — 명단 벽은 공개 읽기 전용 GET
  // 뷰라, 잘못된 딥링크 하나 때문에 전체 화면이 에러로 죽는 것보다 최신 페이지를
  // 보여주는 편이 안전하다. 크래시(캐치되지 않은 예외)는 어느 경로로도 없다.
  const parsed = cursor ? parseCursor(cursor) : null;
  if (parsed) {
    query = query.or(
      `created_at.lt.${parsed.createdAt},and(created_at.eq.${parsed.createdAt},id.lt.${parsed.id})`,
    );
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
      // 공백만 남은 값은 화면에서 빈 따옴표로 보이므로 여기서 null로 접는다.
      message: row.message?.trim() ? row.message.trim() : null,
    })),
    nextCursor: hasMore ? encodeCursor(page[page.length - 1]) : null,
  };
}
