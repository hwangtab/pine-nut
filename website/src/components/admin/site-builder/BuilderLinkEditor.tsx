"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  createEmptyBuilderLink,
  type BuilderLinkItem,
} from "@/lib/custom-sections";

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const next = [...items];
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= next.length) return items;
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

export default function BuilderLinkEditor({
  title,
  items,
  setItems,
}: {
  title: string;
  items: BuilderLinkItem[];
  setItems: Dispatch<SetStateAction<BuilderLinkItem[]>>;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-6">
      <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-admin-text)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--color-admin-muted)]">
            이름과 이동 주소를 같이 편집합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, createEmptyBuilderLink()])}
          className="rounded-xl bg-[var(--color-forest)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-forest-light)]"
        >
          링크 추가
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg)] p-4"
          >
            <div className="grid gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
              <input
                value={item.label}
                onChange={(event) =>
                  setItems((prev) =>
                    prev.map((prevItem) =>
                      prevItem.id === item.id
                        ? { ...prevItem, label: event.target.value }
                        : prevItem,
                    ),
                  )
                }
                className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
                placeholder="링크 이름"
              />
              <input
                value={item.href}
                onChange={(event) =>
                  setItems((prev) =>
                    prev.map((prevItem) =>
                      prevItem.id === item.id
                        ? { ...prevItem, href: event.target.value }
                        : prevItem,
                    ),
                  )
                }
                className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
                placeholder="/story 또는 https://..."
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
              <div className="mr-auto text-xs text-[var(--color-admin-muted)]">
                {index + 1}번째 링크
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => {
                      const current = prev.find((prevItem) => prevItem.id === item.id);
                      if (!current) return prev;
                      return [...prev, { ...current, id: createEmptyBuilderLink().id }];
                    })
                  }
                  className="min-h-[44px] rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)]"
                >
                  복제
                </button>
                <button
                  type="button"
                  onClick={() => setItems((prev) => moveItem(prev, index, -1))}
                  disabled={index === 0}
                  className="min-h-[44px] min-w-[44px] rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)] disabled:opacity-30"
                  aria-label={`${item.label || "링크"} 위로 이동`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => setItems((prev) => moveItem(prev, index, 1))}
                  disabled={index === items.length - 1}
                  className="min-h-[44px] min-w-[44px] rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)] disabled:opacity-30"
                  aria-label={`${item.label || "링크"} 아래로 이동`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => prev.filter((prevItem) => prevItem.id !== item.id))
                  }
                  className="min-h-[44px] rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
