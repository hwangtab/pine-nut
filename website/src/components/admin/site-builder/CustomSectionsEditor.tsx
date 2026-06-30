"use client";

import type { Dispatch, SetStateAction } from "react";
import CustomSectionCard from "@/components/admin/site-builder/CustomSectionCard";
import {
  BUILDER_PAGES,
  createEmptyCustomSection,
  type BuilderPageId,
  type CustomSection,
} from "@/lib/custom-sections";

interface CustomSectionsEditorProps {
  selectedPage: BuilderPageId;
  setSelectedPage: Dispatch<SetStateAction<BuilderPageId>>;
  sections: CustomSection[];
  setSectionsByPage: Dispatch<SetStateAction<Record<BuilderPageId, CustomSection[]>>>;
  onSave: () => void;
  isPending: boolean;
}

export default function CustomSectionsEditor({
  selectedPage,
  setSelectedPage,
  sections,
  setSectionsByPage,
  onSave,
  isPending,
}: CustomSectionsEditorProps) {
  return (
    <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-admin-text)]">
            페이지 커스텀 섹션
          </h2>
          <p className="mt-1 text-sm text-[var(--color-admin-muted)]">
            페이지 본문 아래에 추가 배너형 섹션을 만들고 순서를 조정합니다.
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPage}
            onChange={(event) => setSelectedPage(event.target.value as BuilderPageId)}
            className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
          >
            {BUILDER_PAGES.map((page) => (
              <option key={page.id} value={page.id}>
                {page.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              setSectionsByPage((prev) => ({
                ...prev,
                [selectedPage]: [
                  ...(prev[selectedPage] ?? []),
                  createEmptyCustomSection(),
                ],
              }))
            }
            className="rounded-xl bg-[var(--color-sky)] px-4 py-3 text-sm font-bold text-white transition-colors hover:opacity-90"
          >
            섹션 추가
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {sections.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--color-admin-border)] px-6 py-10 text-center text-[var(--color-admin-muted)]">
            아직 추가된 커스텀 섹션이 없습니다.
          </div>
        )}

        {sections.map((section, index) => (
          <CustomSectionCard
            key={section.id}
            section={section}
            index={index}
            totalCount={sections.length}
            selectedPage={selectedPage}
            setSectionsByPage={setSectionsByPage}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="rounded-xl bg-[var(--color-forest)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-forest-light)] disabled:opacity-40"
        >
          {isPending ? "저장 중..." : "커스텀 섹션 저장"}
        </button>
      </div>
    </section>
  );
}
