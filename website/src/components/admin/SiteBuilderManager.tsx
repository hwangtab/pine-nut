"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { savePageContentAction } from "@/lib/actions/page-content";
import {
  BUILDER_PAGES,
  EXISTING_PAGE_SECTIONS,
  SECTION_SPACING_OPTIONS,
  SECTION_THEME_OPTIONS,
  GLOBAL_LINK_SETS,
  createEmptyBuilderLink,
  createEmptyCustomSection,
  defaultFooterLinks,
  defaultNavLinks,
  parseExistingSectionOrder,
  parseExistingSectionStyles,
  parseBuilderLinks,
  parseCustomSections,
  serializeExistingSectionStyles,
  validateBuilderLinks,
  validateCustomSections,
  type BuilderLinkItem,
  type BuilderPageId,
  type CustomSection,
  type ExistingSectionStyle,
} from "@/lib/custom-sections";

const PAGE_PREVIEW_PATHS: Partial<Record<BuilderPageId, string>> = {
  home: "/",
  story: "/story",
  timeline: "/timeline",
  news: "/news",
  press: "/press",
  petition: "/petition",
  donate: "/donate",
  share: "/share",
  gallery: "/gallery",
  privacy: "/privacy",
  en: "/en",
};

interface SiteBuilderManagerProps {
  initialValues: Record<string, string | undefined>;
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const next = [...items];
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= next.length) return items;
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

export default function SiteBuilderManager({
  initialValues,
}: SiteBuilderManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<BuilderPageId>("home");

  const [navLinks, setNavLinks] = useState<BuilderLinkItem[]>(
    parseBuilderLinks(initialValues[GLOBAL_LINK_SETS.nav], defaultNavLinks()),
  );
  const [footerLinks, setFooterLinks] = useState<BuilderLinkItem[]>(
    parseBuilderLinks(
      initialValues[GLOBAL_LINK_SETS.footer],
      defaultFooterLinks(),
    ),
  );
  const [sectionsByPage, setSectionsByPage] = useState<
    Record<BuilderPageId, CustomSection[]>
  >(() =>
    Object.fromEntries(
      BUILDER_PAGES.map((page) => [
        page.id,
        parseCustomSections(initialValues[`builder.${page.id}.customSections`]),
      ]),
    ) as Record<BuilderPageId, CustomSection[]>,
  );
  const [sectionOrdersByPage, setSectionOrdersByPage] = useState<
    Record<BuilderPageId, string[]>
  >(() =>
    Object.fromEntries(
      BUILDER_PAGES.map((page) => {
        const defaultOrder =
          EXISTING_PAGE_SECTIONS[page.id]?.map((section) => section.id) ?? [];
        return [
          page.id,
          parseExistingSectionOrder(
            initialValues[`builder.${page.id}.sectionOrder`],
            defaultOrder,
          ),
        ];
      }),
    ) as Record<BuilderPageId, string[]>,
  );
  const [sectionStylesByPage, setSectionStylesByPage] = useState<
    Record<BuilderPageId, Record<string, ExistingSectionStyle>>
  >(() =>
    Object.fromEntries(
      BUILDER_PAGES.map((page) => [
        page.id,
        parseExistingSectionStyles(
          initialValues[`builder.${page.id}.sectionStyles`],
        ),
      ]),
    ) as Record<BuilderPageId, Record<string, ExistingSectionStyle>>,
  );

  const sections = useMemo(
    () => sectionsByPage[selectedPage] ?? [],
    [sectionsByPage, selectedPage],
  );
  const selectedPageMeta = BUILDER_PAGES.find((page) => page.id === selectedPage);
  const existingSections = EXISTING_PAGE_SECTIONS[selectedPage] ?? [];
  const currentSectionOrder = sectionOrdersByPage[selectedPage] ?? [];
  const currentSectionStyles = sectionStylesByPage[selectedPage] ?? {};
  const previewPath = PAGE_PREVIEW_PATHS[selectedPage];

  const saveGlobalLinks = () => {
    setSaveMessage(null);
    setSaveError(null);

    const navError = validateBuilderLinks(navLinks);
    if (navError) {
      setSaveError(navError);
      return;
    }

    const footerError = validateBuilderLinks(footerLinks);
    if (footerError) {
      setSaveError(footerError);
      return;
    }

    startTransition(async () => {
      const result = await savePageContentAction([
        {
          content_key: GLOBAL_LINK_SETS.nav,
          content_type: "list",
          value: JSON.stringify(navLinks),
          page: "nav",
          section: "links",
        },
        {
          content_key: GLOBAL_LINK_SETS.footer,
          content_type: "list",
          value: JSON.stringify(footerLinks),
          page: "footer",
          section: "links",
        },
      ]);

      if (result.error) {
        setSaveError(result.error);
      } else {
        setSaveMessage("글로벌 링크를 저장했습니다.");
      }
    });
  };

  const saveSections = () => {
    setSaveMessage(null);
    setSaveError(null);

    const validationError = validateCustomSections(sections);
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    startTransition(async () => {
      const result = await savePageContentAction([
        {
          content_key: `builder.${selectedPage}.customSections`,
          content_type: "list",
          value: JSON.stringify(sections),
          page: selectedPage,
          section: "builder",
        },
      ]);

      if (result.error) {
        setSaveError(result.error);
      } else {
        setSaveMessage("커스텀 섹션을 저장했습니다.");
      }
    });
  };

  const saveExistingSections = () => {
    setSaveMessage(null);
    setSaveError(null);

    const sectionIds = existingSections.map((section) => section.id);

    startTransition(async () => {
      const result = await savePageContentAction([
        {
          content_key: `builder.${selectedPage}.sectionOrder`,
          content_type: "list",
          value: JSON.stringify(currentSectionOrder),
          page: selectedPage,
          section: "builder",
        },
        {
          content_key: `builder.${selectedPage}.sectionStyles`,
          content_type: "list",
          value: JSON.stringify(
            serializeExistingSectionStyles(currentSectionStyles, sectionIds),
          ),
          page: selectedPage,
          section: "builder",
        },
      ]);

      if (result.error) {
        setSaveError(result.error);
      } else {
        setSaveMessage("기존 섹션 설정을 저장했습니다.");
      }
    });
  };

  const renderLinkEditor = (
    title: string,
    items: BuilderLinkItem[],
    setItems: Dispatch<SetStateAction<BuilderLinkItem[]>>,
  ) => (
    <div className="rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
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
            <div className="grid gap-4 md:grid-cols-[1fr_1.6fr_auto]">
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => {
                      const current = prev.find((prevItem) => prevItem.id === item.id);
                      if (!current) return prev;
                      return [...prev, { ...current, id: createEmptyBuilderLink().id }];
                    })
                  }
                  className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)]"
                >
                  복제
                </button>
                <button
                  type="button"
                  onClick={() => setItems((prev) => moveItem(prev, index, -1))}
                  disabled={index === 0}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)] disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => setItems((prev) => moveItem(prev, index, 1))}
                  disabled={index === items.length - 1}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)] disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => prev.filter((prevItem) => prevItem.id !== item.id))
                  }
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
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

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">사이트 빌더</h1>
        <p className="mt-2 text-[var(--color-admin-muted)]">
          글로벌 링크와 페이지별 커스텀 섹션을 코드 수정 없이 관리합니다.
        </p>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-6">
          <h2 className="text-lg font-bold text-[var(--color-admin-text)]">무엇을 여기서 편집하나요?</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
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
            {selectedPageMeta?.label}
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

      {(saveMessage || saveError) && (
        <div
          className={`rounded-2xl border px-5 py-4 text-sm font-medium ${
            saveError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {saveError ?? saveMessage}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        {renderLinkEditor("내비게이션 링크", navLinks, setNavLinks)}
        {renderLinkEditor("푸터 빠른 링크", footerLinks, setFooterLinks)}
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveGlobalLinks}
          disabled={isPending}
          className="rounded-xl bg-[var(--color-forest)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-forest-light)] disabled:opacity-40"
        >
          {isPending ? "저장 중..." : "글로벌 링크 저장"}
        </button>
      </div>

      <section className="rounded-3xl border border-dashed border-[var(--color-admin-border)] px-6 py-5 text-sm leading-relaxed text-[var(--color-admin-muted)]">
        `404 페이지`, 뉴스 상세, 보도자료 상세처럼 사이트 빌더 목록에 없는 특수 화면은 해당 공개 화면으로 가서 인라인 편집 모드로 수정합니다.
      </section>

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
                  [selectedPage]: [...(prev[selectedPage] ?? []), createEmptyCustomSection()],
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
            <div
              key={section.id}
              className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-bg)] p-5"
            >
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
                    disabled={index === sections.length - 1}
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
                  onChange={(event) =>
                    setSectionsByPage((prev) => ({
                      ...prev,
                      [selectedPage]: prev[selectedPage].map((prevSection) =>
                        prevSection.id === section.id
                          ? { ...prevSection, eyebrow: event.target.value }
                          : prevSection,
                      ),
                    }))
                  }
                  className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
                  placeholder="상단 작은 제목"
                />
                <input
                  value={section.title}
                  onChange={(event) =>
                    setSectionsByPage((prev) => ({
                      ...prev,
                      [selectedPage]: prev[selectedPage].map((prevSection) =>
                        prevSection.id === section.id
                          ? { ...prevSection, title: event.target.value }
                          : prevSection,
                      ),
                    }))
                  }
                  className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
                  placeholder="섹션 제목"
                />
              </div>

              <textarea
                value={section.body}
                onChange={(event) =>
                  setSectionsByPage((prev) => ({
                    ...prev,
                    [selectedPage]: prev[selectedPage].map((prevSection) =>
                      prevSection.id === section.id
                        ? { ...prevSection, body: event.target.value }
                        : prevSection,
                    ),
                  }))
                }
                className="mt-4 min-h-32 w-full rounded-2xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base leading-relaxed text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
                placeholder="본문 설명"
              />

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  value={section.imageUrl}
                  onChange={(event) =>
                    setSectionsByPage((prev) => ({
                      ...prev,
                      [selectedPage]: prev[selectedPage].map((prevSection) =>
                        prevSection.id === section.id
                          ? { ...prevSection, imageUrl: event.target.value }
                          : prevSection,
                      ),
                    }))
                  }
                  className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
                  placeholder="이미지 URL"
                />
                <input
                  value={section.imageAlt}
                  onChange={(event) =>
                    setSectionsByPage((prev) => ({
                      ...prev,
                      [selectedPage]: prev[selectedPage].map((prevSection) =>
                        prevSection.id === section.id
                          ? { ...prevSection, imageAlt: event.target.value }
                          : prevSection,
                      ),
                    }))
                  }
                  className="rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
                  placeholder="이미지 대체 텍스트"
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <select
                  value={section.theme}
                  onChange={(event) =>
                    setSectionsByPage((prev) => ({
                      ...prev,
                      [selectedPage]: prev[selectedPage].map((prevSection) =>
                        prevSection.id === section.id
                          ? {
                              ...prevSection,
                              theme: event.target.value as CustomSection["theme"],
                            }
                          : prevSection,
                      ),
                    }))
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
                    setSectionsByPage((prev) => ({
                      ...prev,
                      [selectedPage]: prev[selectedPage].map((prevSection) =>
                        prevSection.id === section.id
                          ? {
                              ...prevSection,
                              align: event.target.value as CustomSection["align"],
                            }
                          : prevSection,
                      ),
                    }))
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
                    onChange={(event) =>
                      setSectionsByPage((prev) => ({
                        ...prev,
                        [selectedPage]: prev[selectedPage].map((prevSection) =>
                          prevSection.id === section.id
                            ? { ...prevSection, visible: event.target.checked }
                            : prevSection,
                        ),
                      }))
                    }
                  />
                  표시
                </label>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-admin-border)] bg-white p-4">
                  <div className="mb-3 text-sm font-semibold text-[var(--color-admin-muted)]">
                    기본 버튼
                  </div>
                  <div className="space-y-3">
                    <input
                      value={section.primaryButton.label}
                      onChange={(event) =>
                        setSectionsByPage((prev) => ({
                          ...prev,
                          [selectedPage]: prev[selectedPage].map((prevSection) =>
                            prevSection.id === section.id
                              ? {
                                  ...prevSection,
                                  primaryButton: {
                                    ...prevSection.primaryButton,
                                    label: event.target.value,
                                  },
                                }
                              : prevSection,
                          ),
                        }))
                      }
                      className="w-full rounded-xl border border-[var(--color-admin-border)] px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
                      placeholder="버튼 텍스트"
                    />
                    <input
                      value={section.primaryButton.href}
                      onChange={(event) =>
                        setSectionsByPage((prev) => ({
                          ...prev,
                          [selectedPage]: prev[selectedPage].map((prevSection) =>
                            prevSection.id === section.id
                              ? {
                                  ...prevSection,
                                  primaryButton: {
                                    ...prevSection.primaryButton,
                                    href: event.target.value,
                                  },
                                }
                              : prevSection,
                          ),
                        }))
                      }
                      className="w-full rounded-xl border border-[var(--color-admin-border)] px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
                      placeholder="/petition 또는 https://..."
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--color-admin-border)] bg-white p-4">
                  <div className="mb-3 text-sm font-semibold text-[var(--color-admin-muted)]">
                    보조 버튼
                  </div>
                  <div className="space-y-3">
                    <input
                      value={section.secondaryButton.label}
                      onChange={(event) =>
                        setSectionsByPage((prev) => ({
                          ...prev,
                          [selectedPage]: prev[selectedPage].map((prevSection) =>
                            prevSection.id === section.id
                              ? {
                                  ...prevSection,
                                  secondaryButton: {
                                    ...prevSection.secondaryButton,
                                    label: event.target.value,
                                  },
                                }
                              : prevSection,
                          ),
                        }))
                      }
                      className="w-full rounded-xl border border-[var(--color-admin-border)] px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
                      placeholder="버튼 텍스트"
                    />
                    <input
                      value={section.secondaryButton.href}
                      onChange={(event) =>
                        setSectionsByPage((prev) => ({
                          ...prev,
                          [selectedPage]: prev[selectedPage].map((prevSection) =>
                            prevSection.id === section.id
                              ? {
                                  ...prevSection,
                                  secondaryButton: {
                                    ...prevSection.secondaryButton,
                                    href: event.target.value,
                                  },
                                }
                              : prevSection,
                          ),
                        }))
                      }
                      className="w-full rounded-xl border border-[var(--color-admin-border)] px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
                      placeholder="/donate 또는 https://..."
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={saveSections}
            disabled={isPending}
            className="rounded-xl bg-[var(--color-forest)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-forest-light)] disabled:opacity-40"
          >
            {isPending ? "저장 중..." : "커스텀 섹션 저장"}
          </button>
        </div>
      </section>

      {existingSections.length > 0 && (
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
                  className="grid gap-4 rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg)] p-4 md:grid-cols-[1.4fr_180px_180px_auto]"
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
              onClick={saveExistingSections}
              disabled={isPending}
              className="rounded-xl bg-[var(--color-forest)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-forest-light)] disabled:opacity-40"
            >
              {isPending ? "저장 중..." : "기존 섹션 저장"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
