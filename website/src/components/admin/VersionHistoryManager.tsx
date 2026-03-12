"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AuditEntry } from "@/lib/data/audit";
import { restorePageContentVersionAction } from "@/lib/actions/page-content";
import { restoreNewsVersionAction } from "@/lib/actions/news";
import { restoreTimelineVersionAction } from "@/lib/actions/timeline";

interface VersionHistoryManagerProps {
  entries: AuditEntry[];
}

function summarizePayload(entry: AuditEntry): string {
  const before = Array.isArray(entry.payload?.before)
    ? entry.payload?.before.length
    : entry.payload?.before
      ? 1
      : 0;
  const after = Array.isArray(entry.payload?.after)
    ? entry.payload?.after.length
    : entry.payload?.after
      ? 1
      : 0;

  if (entry.table_name === "page_content") {
    if (entry.action === "bulk_update") {
      return `${after}개 편집 항목 저장`;
    }
    if (entry.action === "delete") {
      return `${before}개 편집 항목 기본값 복원`;
    }
  }

  const label =
    entry.table_name === "news"
      ? typeof entry.payload?.after === "object" && entry.payload?.after && "title" in entry.payload.after
        ? (entry.payload.after.title as string)
        : typeof entry.payload?.before === "object" && entry.payload?.before && "title" in entry.payload.before
          ? (entry.payload.before.title as string)
          : "소식 항목"
      : entry.table_name === "timeline_events"
        ? typeof entry.payload?.after === "object" && entry.payload?.after && "title" in entry.payload.after
          ? (entry.payload.after.title as string)
          : typeof entry.payload?.before === "object" && entry.payload?.before && "title" in entry.payload.before
            ? (entry.payload.before.title as string)
            : "타임라인 항목"
        : null;

  if (label) {
    return `${label} · ${entry.action}`;
  }

  return `${entry.table_name} ${entry.action}`;
}

export default function VersionHistoryManager({
  entries,
}: VersionHistoryManagerProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">버전 히스토리</h1>
        <p className="mt-2 text-[var(--color-admin-muted)]">
          최근 변경 내역을 확인하고 페이지 콘텐츠, 소식, 타임라인 변경을 이전 상태로 복원할 수 있습니다.
        </p>
      </div>

      {(message || error) && (
        <div
          className={`rounded-2xl border px-5 py-4 text-sm font-medium ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry) => {
          const isRestorable =
            ["page_content", "news", "timeline_events"].includes(entry.table_name) &&
            !!entry.payload?.before;

          return (
            <div
              key={entry.id}
              className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-admin-muted)]">
                      {entry.table_name}
                    </span>
                    <span className="rounded-full bg-[var(--color-forest)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-forest)]">
                      {entry.action}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[var(--color-admin-text)]">
                    {summarizePayload(entry)}
                  </h2>
                  <div className="text-sm text-[var(--color-admin-muted)]">
                    {entry.user_email} ·{" "}
                    {new Intl.DateTimeFormat("ko-KR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(entry.created_at))}
                  </div>
                  {entry.entity_key && (
                    <div className="text-sm font-mono text-[var(--color-admin-muted)]">
                      {entry.entity_key}
                    </div>
                  )}
                </div>

                {isRestorable && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      if (!window.confirm("이 버전의 이전 상태로 복원하시겠습니까?")) {
                        return;
                      }

                      setError(null);
                      setMessage(null);

                      startTransition(async () => {
                        const result =
                          entry.table_name === "page_content"
                            ? await restorePageContentVersionAction(entry.payload)
                            : entry.table_name === "news"
                              ? await restoreNewsVersionAction(entry.payload)
                              : await restoreTimelineVersionAction(entry.payload);

                        if (result?.error) {
                          setError(result.error);
                          return;
                        }

                        setMessage("선택한 버전으로 복원했습니다.");
                        router.refresh();
                      });
                    }}
                    className="rounded-xl bg-[var(--color-forest)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--color-forest-light)] disabled:opacity-40"
                  >
                    {isPending ? "복원 중..." : "이 버전 복원"}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {entries.length === 0 && (
          <div className="rounded-3xl border border-dashed border-[var(--color-admin-border)] px-6 py-16 text-center text-[var(--color-admin-muted)]">
            아직 기록된 변경 내역이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
