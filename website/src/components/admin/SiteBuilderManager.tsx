"use client";

import { useMemo, useState, useTransition } from "react";
import BuilderLinkEditor from "@/components/admin/site-builder/BuilderLinkEditor";
import CustomSectionsEditor from "@/components/admin/site-builder/CustomSectionsEditor";
import ExistingSectionsEditor from "@/components/admin/site-builder/ExistingSectionsEditor";
import SiteBuilderOverview from "@/components/admin/site-builder/SiteBuilderOverview";
import { savePageContentAction } from "@/lib/actions/page-content";
import {
  BUILDER_PAGES,
  EXISTING_PAGE_SECTIONS,
  GLOBAL_LINK_SETS,
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

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">사이트 빌더</h1>
        <p className="mt-2 text-[var(--color-admin-muted)]">
          글로벌 링크와 페이지별 커스텀 섹션을 코드 수정 없이 관리합니다.
        </p>
      </div>

      <SiteBuilderOverview
        selectedPageLabel={selectedPageMeta?.label}
        previewPath={previewPath}
      />

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
        <BuilderLinkEditor title="내비게이션 링크" items={navLinks} setItems={setNavLinks} />
        <BuilderLinkEditor title="푸터 빠른 링크" items={footerLinks} setItems={setFooterLinks} />
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
        <strong className="text-[var(--color-admin-text)]">404 페이지</strong>, 뉴스 상세, 보도자료 상세처럼 사이트 빌더 목록에 없는 특수 화면은 해당 공개 화면으로 가서 인라인 편집 모드로 수정합니다.
      </section>

      <CustomSectionsEditor
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        sections={sections}
        setSectionsByPage={setSectionsByPage}
        onSave={saveSections}
        isPending={isPending}
      />

      <ExistingSectionsEditor
        existingSections={existingSections}
        selectedPage={selectedPage}
        currentSectionOrder={currentSectionOrder}
        currentSectionStyles={currentSectionStyles}
        setSectionOrdersByPage={setSectionOrdersByPage}
        setSectionStylesByPage={setSectionStylesByPage}
        onSave={saveExistingSections}
        isPending={isPending}
      />
    </div>
  );
}
