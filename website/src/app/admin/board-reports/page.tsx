import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/actions/auth";
import { getReportQueue } from "@/lib/data/board-reports";
import ReportsManager from "./ReportsManager";

type SearchParams = Promise<{ page?: string }>;

const pagerCls =
  "rounded-lg border border-[var(--color-admin-border)] px-3 py-1.5 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-bg)]";

export default async function BoardReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getAdminContext();
  if (ctx.role !== "owner" && ctx.role !== "editor") redirect("/admin");
  const params = await searchParams;
  const queue = await getReportQueue(parseInt(params.page ?? "1", 10) || 1);
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-2">게시판 신고</h1>
      <p className="mb-6 text-sm text-[var(--color-admin-muted)]">
        신고된 글/댓글을 확인하고 숨김·해결·무시 처리합니다.
      </p>
      {(queue.pendingTruncated || queue.handledTruncated) && (
        <p className="mb-4 rounded-lg bg-[var(--color-warm)]/10 px-3 py-2 text-sm text-[var(--color-warm)]">
          {queue.pendingTruncated
            ? "미해결 신고가 많아 최근 1,000건만 불러왔습니다. 처리하면 오래된 신고가 이어서 나타납니다."
            : "처리된 신고는 최근 500건만 표시합니다."}
        </p>
      )}
      <ReportsManager groups={queue.groups} />
      {queue.totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-3" aria-label="신고 목록 페이지">
          {queue.page > 1 && (
            <Link href={`/admin/board-reports?page=${queue.page - 1}`} className={pagerCls}>
              이전
            </Link>
          )}
          <span className="text-sm text-[var(--color-admin-muted)]">
            {queue.page} / {queue.totalPages} (대상 {queue.totalGroups}건)
          </span>
          {queue.page < queue.totalPages && (
            <Link href={`/admin/board-reports?page=${queue.page + 1}`} className={pagerCls}>
              다음
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
