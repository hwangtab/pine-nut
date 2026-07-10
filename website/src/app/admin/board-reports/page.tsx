import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/actions/auth";
import { getReportQueue } from "@/lib/data/board-reports";
import ReportsManager from "./ReportsManager";

export default async function BoardReportsPage() {
  const ctx = await getAdminContext();
  if (ctx.role !== "owner" && ctx.role !== "editor") redirect("/admin");
  const groups = await getReportQueue();
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-2">게시판 신고</h1>
      <p className="mb-6 text-sm text-[var(--color-admin-muted)]">
        신고된 글/댓글을 확인하고 숨김·해결·무시 처리합니다.
      </p>
      <ReportsManager groups={groups} />
    </div>
  );
}
