"use client";

import type { Dispatch, SetStateAction } from "react";
import { moveItem } from "./move-item";
import {
  SECTION_SPACING_OPTIONS,
  SECTION_THEME_OPTIONS,
  type BuilderPageId,
  type ExistingSectionStyle,
} from "@/lib/custom-sections";

interface ExistingSectionMeta {
  id: string;
  label: string;
}

export default function ExistingSectionsEditor({
  existingSections,
  selectedPage,
  currentSectionOrder,
  currentSectionStyles,
  setSectionOrdersByPage,
  setSectionStylesByPage,
  onSave,
  isPending,
}: {
  existingSections: ExistingSectionMeta[];
  selectedPage: BuilderPageId;
  currentSectionOrder: string[];
  currentSectionStyles: Record<string, ExistingSectionStyle>;
  setSectionOrdersByPage: Dispatch<SetStateAction<Record<BuilderPageId, string[]>>>;
  setSectionStylesByPage: Dispatch<
    SetStateAction<Record<BuilderPageId, Record<string, ExistingSectionStyle>>>
  >;
  onSave: () => void;
  isPending: boolean;
}) {
  if (existingSections.length === 0) return null;

  return (
    <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[var(--color-admin-text)]">
          기존 섹션 순서와 스타일
        </h2>
        <p className="mt-1 text-sm text-[var(--color-admin-muted)]">
          페이지에 이미 있는 섹션의 노출 순서와 배경/간격을 조정합니다.
        </p>
      </div>

      <div className="space-y-4">
        {currentSectionOrder.map((sectionId, index) => {
          const sectionMeta = existingSections.find(
            (section) => section.id === sectionId,
          );
          if (!sectionMeta) return null;

          const style = currentSectionStyles[sectionId] ?? {
            id: sectionId,
            theme: "default",
            spacing: "normal",
          };

          return (
            <div
              key={sectionId}
              className="grid gap-3 sm:gap-4 rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg)] p-4 sm:grid-cols-2 md:grid-cols-[1.4fr_180px_180px_auto]"
            >
              <div>
                <div className="text-sm font-semibold text-[var(--color-admin-muted)]">
                  #{index + 1}
                </div>
                <div className="mt-1 text-base font-bold text-[var(--color-admin-text)]">
                  {sectionMeta.label}
                </div>
              </div>
              <select
                value={style.theme}
                onChange={(event) =>
                  setSectionStylesByPage((prev) => ({
                    ...prev,
                    [selectedPage]: {
                      ...prev[selectedPage],
                      [sectionId]: {
                        ...style,
                        theme: event.target.value as ExistingSectionStyle["theme"],
                      },
                    },
                  }))
                }
                className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
              >
                {SECTION_THEME_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={style.spacing}
                onChange={(event) =>
                  setSectionStylesByPage((prev) => ({
                    ...prev,
                    [selectedPage]: {
                      ...prev[selectedPage],
                      [sectionId]: {
                        ...style,
                        spacing: event.target.value as ExistingSectionStyle["spacing"],
                      },
                    },
                  }))
                }
                className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
              >
                {SECTION_SPACING_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSectionOrdersByPage((prev) => ({
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
                    setSectionOrdersByPage((prev) => ({
                      ...prev,
                      [selectedPage]: moveItem(prev[selectedPage] ?? [], index, 1),
                    }))
                  }
                  disabled={index === currentSectionOrder.length - 1}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)] disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="rounded-xl bg-[var(--color-forest)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-forest-light)] disabled:opacity-40"
        >
          {isPending ? "저장 중..." : "기존 섹션 저장"}
        </button>
      </div>
    </section>
  );
}
