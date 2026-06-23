"use client";

import Link from "next/link";

export default function SiteBuilderOverview({
  selectedPageLabel,
  previewPath,
}: {
  selectedPageLabel?: string;
  previewPath?: string;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
      <div className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-6">
        <h2 className="text-lg font-bold text-[var(--color-admin-text)]">무엇을 여기서 편집하나요?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-2xl bg-[var(--color-bg)] p-4">
            <div className="text-sm font-bold text-[var(--color-admin-text)]">글로벌 링크</div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-admin-muted)]">
              내비게이션과 푸터 링크 세트를 관리합니다.
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-bg)] p-4">
            <div className="text-sm font-bold text-[var(--color-admin-text)]">커스텀 섹션</div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-admin-muted)]">
              페이지 하단 배너형 섹션을 추가, 복제, 삭제합니다.
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-bg)] p-4">
            <div className="text-sm font-bold text-[var(--color-admin-text)]">기존 섹션 정리</div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-admin-muted)]">
              일부 주요 페이지의 기존 섹션 순서와 배경/간격을 바꿉니다.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-admin-muted)]">
          현재 편집 페이지
        </div>
        <h2 className="mt-2 text-xl font-bold text-[var(--color-admin-text)]">
          {selectedPageLabel}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-admin-muted)]">
          세부 문구, 이미지, 링크 자체는 공개 페이지에서 인라인 편집 모드로 수정하고, 여기서는 구조와 링크 세트를 관리합니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {previewPath ? (
            <Link
              href={previewPath}
              className="rounded-xl bg-[var(--color-forest)] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-forest-light)]"
            >
              공개 페이지 열기
            </Link>
          ) : (
            <div className="rounded-xl bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-admin-muted)]">
              특수 페이지는 직접 주소에서 인라인 편집하세요.
            </div>
          )}
          <Link
            href="/admin/history"
            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-bg)]"
          >
            변경 히스토리 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
