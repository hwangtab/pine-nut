import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface ReportGroup {
  targetType: "post" | "comment";
  targetId: number;
  postId: number;
  reportCount: number;
  reasons: string[];
  hasPending: boolean;
  latestAt: string;
  snippet: string;
}

interface ReportRow {
  target_type: "post" | "comment";
  target_id: number;
  reason: string;
  status: string;
  created_at: string;
}

// 검토큐: RLS(admin_can_edit)로 기획단만 읽힘. 저볼륨 가정 → 전체 신고를 읽어 대상별 JS 그룹핑.
export async function getReportQueue(): Promise<ReportGroup[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("board_reports")
    .select("target_type, target_id, reason, status, created_at")
    .order("created_at", { ascending: false });
  if (error || !data) {
    if (error) console.error("getReportQueue", error);
    return [];
  }
  const rows = data as ReportRow[];

  // 대상별 그룹핑
  const groups = new Map<string, ReportGroup>();
  for (const r of rows) {
    const key = `${r.target_type}:${r.target_id}`;
    const g = groups.get(key);
    if (!g) {
      groups.set(key, {
        targetType: r.target_type,
        targetId: r.target_id,
        postId: 0,
        reportCount: 1,
        reasons: [r.reason],
        hasPending: r.status === "pending",
        latestAt: r.created_at,
        snippet: "",
      });
    } else {
      g.reportCount += 1;
      if (!g.reasons.includes(r.reason)) g.reasons.push(r.reason);
      if (r.status === "pending") g.hasPending = true;
      if (r.created_at > g.latestAt) g.latestAt = r.created_at;
    }
  }
  const list = [...groups.values()];

  // 댓글 대상의 post_id + 스니펫(댓글 내용) 배치 조회
  const commentIds = list.filter((g) => g.targetType === "comment").map((g) => g.targetId);
  if (commentIds.length) {
    const { data: cs } = await supabase
      .from("board_comments").select("id, post_id, content").in("id", commentIds);
    for (const c of (cs ?? []) as { id: number; post_id: number; content: string }[]) {
      const g = list.find((x) => x.targetType === "comment" && x.targetId === c.id);
      if (g) { g.postId = c.post_id; g.snippet = c.content.slice(0, 60); }
    }
  }

  // 글 스니펫(제목) 배치 조회: 글 대상 + 댓글 대상이 속한 글
  const postIds = list.filter((g) => g.targetType === "post").map((g) => g.targetId);
  const commentPostIds = list.filter((g) => g.targetType === "comment" && g.postId).map((g) => g.postId);
  const allPostIds = [...new Set([...postIds, ...commentPostIds])];
  if (allPostIds.length) {
    const { data: ps } = await supabase.from("board_posts").select("id, title").in("id", allPostIds);
    const titleMap = new Map<number, string>();
    for (const p of (ps ?? []) as { id: number; title: string }[]) titleMap.set(p.id, p.title);
    for (const g of list) {
      if (g.targetType === "post") {
        g.postId = g.targetId;
        g.snippet = titleMap.get(g.targetId) ?? "(삭제된 글)";
      }
    }
  }

  // 미해결 우선, 최신순
  return list.sort(
    (a, b) => Number(b.hasPending) - Number(a.hasPending) || b.latestAt.localeCompare(a.latestAt),
  );
}
