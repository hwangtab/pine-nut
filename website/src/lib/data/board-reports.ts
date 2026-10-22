import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface ReportGroup {
  targetType: "post" | "comment";
  targetId: number;
  // 대상 글 id. 댓글이 지워져 어느 글의 댓글인지 알 수 없으면 null(링크를 만들지 않는다).
  postId: number | null;
  reportCount: number;
  reasons: string[];
  hasPending: boolean;
  latestAt: string;
  snippet: string;
  // 대상이 이미 숨김 상태인지. 대상을 찾지 못하면 null.
  isHidden: boolean | null;
}

export interface ReportQueue {
  groups: ReportGroup[];
  page: number;
  totalPages: number;
  totalGroups: number;
  // 아래 행 상한에 걸려 오래된 신고 일부를 읽지 못했는지. true면 화면에 알린다.
  pendingTruncated: boolean;
  handledTruncated: boolean;
}

interface ReportRow {
  target_type: "post" | "comment";
  target_id: number;
  reason: string;
  status: string;
  created_at: string;
}

// 신고 행을 읽는 명시적 상한. PostgREST 기본 상한(1000행)에 조용히 잘리지 않도록 직접 걸고,
// 넘치면 화면에 알린다. 미해결은 처리해야 할 일이라 넉넉히, 처리된 기록은 최근 것만 본다.
const PENDING_ROW_LIMIT = 1000;
const HANDLED_ROW_LIMIT = 500;
export const REPORT_GROUPS_PER_PAGE = 30;

const EMPTY_QUEUE: ReportQueue = {
  groups: [], page: 1, totalPages: 1, totalGroups: 0, pendingTruncated: false, handledTruncated: false,
};

// 검토큐: RLS(admin_can_edit)로 기획단만 읽힘. 미해결/처리됨을 나눠 각각 상한까지 읽고 대상별로
// JS 그룹핑한 뒤, 그룹 단위로 페이지를 나눈다.
export async function getReportQueue(requestedPage = 1): Promise<ReportQueue> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return EMPTY_QUEUE;
  const columns = "target_type, target_id, reason, status, created_at";
  const [pendingRes, handledRes] = await Promise.all([
    supabase
      .from("board_reports").select(columns)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(PENDING_ROW_LIMIT + 1),
    supabase
      .from("board_reports").select(columns)
      .neq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(HANDLED_ROW_LIMIT + 1),
  ]);
  if (pendingRes.error || handledRes.error || !pendingRes.data || !handledRes.data) {
    console.error("getReportQueue", pendingRes.error ?? handledRes.error);
    return EMPTY_QUEUE;
  }
  const pendingRows = pendingRes.data as ReportRow[];
  const handledRows = handledRes.data as ReportRow[];
  const pendingTruncated = pendingRows.length > PENDING_ROW_LIMIT;
  const handledTruncated = handledRows.length > HANDLED_ROW_LIMIT;
  const rows = [...pendingRows.slice(0, PENDING_ROW_LIMIT), ...handledRows.slice(0, HANDLED_ROW_LIMIT)];

  // 대상별 그룹핑
  const groups = new Map<string, ReportGroup>();
  for (const r of rows) {
    const key = `${r.target_type}:${r.target_id}`;
    const g = groups.get(key);
    if (!g) {
      groups.set(key, {
        targetType: r.target_type,
        targetId: r.target_id,
        postId: r.target_type === "post" ? r.target_id : null,
        reportCount: 1,
        reasons: [r.reason],
        hasPending: r.status === "pending",
        latestAt: r.created_at,
        snippet: "",
        isHidden: null,
      });
    } else {
      g.reportCount += 1;
      if (!g.reasons.includes(r.reason)) g.reasons.push(r.reason);
      if (r.status === "pending") g.hasPending = true;
      if (r.created_at > g.latestAt) g.latestAt = r.created_at;
    }
  }

  // 미해결 우선, 최신순으로 정렬한 뒤 현재 페이지 그룹만 상세(스니펫·숨김 상태)를 조회한다.
  const sorted = [...groups.values()].sort(
    (a, b) => Number(b.hasPending) - Number(a.hasPending) || b.latestAt.localeCompare(a.latestAt),
  );
  const totalGroups = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalGroups / REPORT_GROUPS_PER_PAGE));
  const page = Math.min(Math.max(1, Math.floor(requestedPage) || 1), totalPages);
  const list = sorted.slice((page - 1) * REPORT_GROUPS_PER_PAGE, page * REPORT_GROUPS_PER_PAGE);

  // 댓글 대상의 post_id + 스니펫(댓글 내용) + 숨김 상태 배치 조회
  const commentIds = list.filter((g) => g.targetType === "comment").map((g) => g.targetId);
  if (commentIds.length) {
    const { data: cs } = await supabase
      .from("board_comments").select("id, post_id, content, is_hidden").in("id", commentIds);
    const byId = new Map<number, { post_id: number; content: string; is_hidden: boolean }>();
    for (const c of (cs ?? []) as { id: number; post_id: number; content: string; is_hidden: boolean }[]) {
      byId.set(c.id, c);
    }
    for (const g of list) {
      if (g.targetType !== "comment") continue;
      const c = byId.get(g.targetId);
      if (c) {
        g.postId = c.post_id;
        g.snippet = c.content.slice(0, 60);
        g.isHidden = c.is_hidden;
      } else {
        g.snippet = "(삭제됐거나 찾을 수 없는 댓글)";
      }
    }
  }

  // 글 대상의 스니펫(제목) + 숨김 상태 배치 조회
  const postIds = list.filter((g) => g.targetType === "post").map((g) => g.targetId);
  if (postIds.length) {
    const { data: ps } = await supabase.from("board_posts").select("id, title, is_hidden").in("id", postIds);
    const byId = new Map<number, { title: string; is_hidden: boolean }>();
    for (const p of (ps ?? []) as { id: number; title: string; is_hidden: boolean }[]) byId.set(p.id, p);
    for (const g of list) {
      if (g.targetType !== "post") continue;
      const p = byId.get(g.targetId);
      g.snippet = p?.title ?? "(삭제된 글)";
      g.isHidden = p ? p.is_hidden : null;
    }
  }

  return { groups: list, page, totalPages, totalGroups, pendingTruncated, handledTruncated };
}
