"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  BUILDER_PAGES,
  createEmptyCustomSection,
  type BuilderPageId,
  type CustomSection,
  type CustomSectionButton,
} from "@/lib/custom-sections";

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const next = [...items];
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= next.length) return items;
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

interface CustomSectionsEditorProps {
  selectedPage: BuilderPageId;
  setSelectedPage: Dispatch<SetStateAction<BuilderPageId>>;
  sections: CustomSection[];
  setSectionsByPage: Dispatch<SetStateAction<Record<BuilderPageId, CustomSection[]>>>;
  onSave: () => void;
  isPending: boolean;
}

interface CustomSectionCardProps {
  section: CustomSection;
  index: number;
  totalCount: number;
  selectedPage: BuilderPageId;
  setSectionsByPage: Dispatch<SetStateAction<Record<BuilderPageId, CustomSection[]>>>;
}

interface SectionButtonEditorProps {
  title: string;
  button: CustomSectionButton;
  onChange: (button: CustomSectionButton) => void;
}

function SectionButtonEditor({
  title,
  button,
  onChange,
}: SectionButtonEditorProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-admin-border)] bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-[var(--color-admin-muted)]">
        {title}
      </div>
      <div className="space-y-3">
        <input
          value={button.label}
          onChange={(event) =>
            onChange({
              ...button,
              label: event.target.value,
            })
          }
          className="w-full rounded-xl border border-[var(--color-admin-border)] px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
          placeholder="버튼 텍스트"
        />
        <input
          value={button.href}
          onChange={(event) =>
            onChange({
              ...button,
              href: event.target.value,
            })
          }
          className="w-full rounded-xl border border-[var(--color-admin-border)] px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
          placeholder="/petition 또는 https://..."
        />
      </div>
    </div>
  );
}

function CustomSectionCard({
  section,
  index,
  totalCount,
  selectedPage,
  setSectionsByPage,
}: CustomSectionCardProps) {
  const updateSection = <Key extends keyof CustomSection>(
    field: Key,
    value: CustomSection[Key],
  ) => {
    setSectionsByPage((prev) => ({
      ...prev,
      [selectedPage]: (prev[selectedPage] ?? []).map((prevSection) =>
        prevSection.id === section.id
          ? { ...prevSection, [field]: value }
          : prevSection,
      ),
    }));
  };

  return (
    <div className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-bg)] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[var(--color-admin-muted)]">
          #{index + 1} {section.title || "새 섹션"}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setSectionsByPage((prev) => {
                const current = prev[selectedPage] ?? [];
                const copy = current[index];
                if (!copy) return prev;
                return {
                  ...prev,
                  [selectedPage]: [
                    ...current,
                    { ...copy, id: createEmptyCustomSection().id },
                  ],
                };
              })
            }
            className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)]"
          >
            복제
          </button>
          <button
            type="button"
            onClick={() =>
              setSectionsByPage((prev) => ({
                ...prev,
                [selectedPage]: moveItem(prev[selectedPage] ?? [], index, -1),
              }))
            }
            disabled={index === 0}
            className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)] disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() =>
              setSectionsByPage((prev) => ({
                ...prev,
                [selectedPage]: moveItem(prev[selectedPage] ?? [], index, 1),
              }))
            }
            disabled={index === totalCount - 1}
            className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)] disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() =>
              setSectionsByPage((prev) => ({
                ...prev,
                [selectedPage]: (prev[selectedPage] ?? []).filter(
                  (prevSection) => prevSection.id !== section.id,
                ),
              }))
            }
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            삭제
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={section.eyebrow}
          onChange={(event) => updateSection("eyebrow", event.target.value)}
          className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
          placeholder="상단 작은 제목"
        />
        <input
          value={section.title}
          onChange={(event) => updateSection("title", event.target.value)}
          className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
          placeholder="섹션 제목"
        />
      </div>

      <textarea
        value={section.body}
        onChange={(event) => updateSection("body", event.target.value)}
        className="mt-4 min-h-32 w-full rounded-2xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base leading-relaxed text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
        placeholder="본문 설명"
      />

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <input
          value={section.imageUrl}
          onChange={(event) => updateSection("imageUrl", event.target.value)}
          className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
          placeholder="이미지 URL"
        />
        <input
          value={section.imageAlt}
          onChange={(event) => updateSection("imageAlt", event.target.value)}
          className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
          placeholder="이미지 대체 텍스트"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <select
          value={section.theme}
          onChange={(event) =>
            updateSection("theme", event.target.value as CustomSection["theme"])
          }
          className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
        >
          <option value="paper">화이트</option>
          <option value="sand">웜</option>
          <option value="forest">포레스트</option>
        </select>
        <select
          value={section.align}
          onChange={(event) =>
            updateSection("align", event.target.value as CustomSection["align"])
          }
          className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
        >
          <option value="left">좌측 정렬</option>
          <option value="center">중앙 정렬</option>
        </select>
        <label className="flex items-center gap-3 rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-admin-text)]">
          <input
            type="checkbox"
            checked={section.visible}
            onChange={(event) => updateSection("visible", event.target.checked)}
          />
          표시
        </label>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <SectionButtonEditor
          title="기본 버튼"
          button={section.primaryButton}
          onChange={(button) => updateSection("primaryButton", button)}
        />
        <SectionButtonEditor
          title="보조 버튼"
          button={section.secondaryButton}
          onChange={(button) => updateSection("secondaryButton", button)}
        />
      </div>
    </div>
  );
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
