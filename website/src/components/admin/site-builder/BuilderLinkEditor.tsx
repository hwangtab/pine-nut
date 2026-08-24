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

/**
 * 대메뉴 하나의 하위 링크 목록. 공연처럼 항목이 계속 늘어나는 묶음을 위해
 * 1단계 하위 메뉴만 편집한다 — 파서도 1단계까지만 읽으므로 더 깊이 만들 수 없다.
 */
function ChildLinkEditor({
  item,
  setItems,
}: {
  item: BuilderLinkItem;
  setItems: Dispatch<SetStateAction<BuilderLinkItem[]>>;
}) {
  const children = item.children ?? [];

  const updateChildren = (
    updater: (current: BuilderLinkItem[]) => BuilderLinkItem[],
  ) =>
    setItems((prev) =>
      prev.map((prevItem) => {
        if (prevItem.id !== item.id) return prevItem;
        const next = updater(prevItem.children ?? []);
        // 빈 배열을 남기면 내비가 "하위 있는 대메뉴"로 오해해 화살표를 그린다.
        if (next.length === 0) {
          const rest = { ...prevItem };
          delete rest.children;
          return rest;
        }
        return { ...prevItem, children: next };
      }),
    );

  return (
    <div className="mt-3 rounded-xl border border-dashed border-[var(--color-admin-border)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[var(--color-admin-muted)]">
          하위 메뉴 {children.length > 0 ? `${children.length}개` : "없음"}
        </p>
        <button
          type="button"
          onClick={() => updateChildren((current) => [...current, createEmptyBuilderLink()])}
          className="min-h-[36px] rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)]"
        >
          하위 링크 추가
        </button>
      </div>

      {children.length > 0 && (
        <div className="mt-3 space-y-2">
          {children.map((child, childIndex) => (
            <div
              key={child.id}
              className="grid gap-2 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_auto]"
            >
              <input
                value={child.label}
                onChange={(event) =>
                  updateChildren((current) =>
                    current.map((currentChild) =>
                      currentChild.id === child.id
                        ? { ...currentChild, label: event.target.value }
                        : currentChild,
                    ),
                  )
                }
                className="rounded-lg border border-[var(--color-admin-border)] bg-white px-3 py-2 text-sm text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
                placeholder="하위 링크 이름"
              />
              <input
                value={child.href}
                onChange={(event) =>
                  updateChildren((current) =>
                    current.map((currentChild) =>
                      currentChild.id === child.id
                        ? { ...currentChild, href: event.target.value }
                        : currentChild,
                    ),
                  )
                }
                className="rounded-lg border border-[var(--color-admin-border)] bg-white px-3 py-2 text-sm text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
                placeholder="/concert/before-cut"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateChildren((current) => moveItem(current, childIndex, -1))}
                  disabled={childIndex === 0}
                  className="min-h-[40px] min-w-[40px] rounded-lg bg-white px-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)] disabled:opacity-30"
                  aria-label={`${child.label || "하위 링크"} 위로 이동`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => updateChildren((current) => moveItem(current, childIndex, 1))}
                  disabled={childIndex === children.length - 1}
                  className="min-h-[40px] min-w-[40px] rounded-lg bg-white px-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)] disabled:opacity-30"
                  aria-label={`${child.label || "하위 링크"} 아래로 이동`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateChildren((current) =>
                      current.filter((currentChild) => currentChild.id !== child.id),
                    )
                  }
                  className="min-h-[40px] rounded-lg bg-red-50 px-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
            <ChildLinkEditor item={item} setItems={setItems} />

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
                      // 하위 링크 id까지 새로 발급하지 않으면 원본과 사본이 같은 id를
                      // 공유해 React key가 겹치고, 한쪽을 고치면 양쪽이 같이 바뀐다.
                      const copy: BuilderLinkItem = {
                        ...current,
                        id: createEmptyBuilderLink().id,
                        ...(current.children
                          ? {
                              children: current.children.map((child) => ({
                                ...child,
                                id: createEmptyBuilderLink().id,
                              })),
                            }
                          : {}),
                      };
                      return [...prev, copy];
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
