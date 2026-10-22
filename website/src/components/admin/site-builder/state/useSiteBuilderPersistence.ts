"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { savePageContentAction } from "@/lib/actions/page-content";
import type { ContentChange } from "@/lib/actions/page-content/types";
import {
  GLOBAL_LINK_SETS,
  serializeExistingSectionStyles,
  validateBuilderLinks,
  validateCustomSections,
  type BuilderLinkItem,
  type BuilderPageId,
  type CustomSection,
  type ExistingSectionStyle,
} from "@/lib/custom-sections";
import {
  hasSnapshotChanges,
  pickSnapshotKeys,
  snapshotBuilderState,
} from "./builder-snapshot";
import type {
  SectionOrdersByPage,
  SectionStylesByPage,
  SectionsByPage,
  SiteBuilderInitialValues,
} from "./initial-site-builder-state";

interface ExistingSectionMeta {
  id: string;
}

interface UseSiteBuilderPersistenceInput {
  initialValues: SiteBuilderInitialValues;
  navLinks: BuilderLinkItem[];
  footerLinks: BuilderLinkItem[];
  selectedPage: BuilderPageId;
  sections: CustomSection[];
  existingSections: ExistingSectionMeta[];
  currentSectionOrder: string[];
  currentSectionStyles: Record<string, ExistingSectionStyle>;
  sectionsByPage: SectionsByPage;
  sectionOrdersByPage: SectionOrdersByPage;
  sectionStylesByPage: SectionStylesByPage;
}

type PendingChange = Omit<ContentChange, "base_value">;

export function useSiteBuilderPersistence({
  initialValues,
  navLinks,
  footerLinks,
  selectedPage,
  sections,
  existingSections,
  currentSectionOrder,
  currentSectionStyles,
  sectionsByPage,
  sectionOrdersByPage,
  sectionStylesByPage,
}: UseSiteBuilderPersistenceInput) {
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  // 화면을 연 시점(또는 마지막 저장 시점)의 DB 값. 인라인 편집기와 같이 base_value로
  // 실어 보내, 그 사이 다른 관리자가 저장했으면 서버가 덮어쓰지 않고 충돌을 알린다.
  // 키가 아예 없으면(로드하지 않은 값) undefined로 두어 검사를 건너뛴다.
  const [baseValues, setBaseValues] = useState<
    Record<string, string | null | undefined>
  >(() =>
    Object.fromEntries(
      Object.entries(initialValues).map(([key, value]) => [key, value ?? null]),
    ),
  );

  const currentSnapshot = useMemo(
    () =>
      snapshotBuilderState({
        navLinks,
        footerLinks,
        sectionsByPage,
        sectionOrdersByPage,
        sectionStylesByPage,
      }),
    [navLinks, footerLinks, sectionsByPage, sectionOrdersByPage, sectionStylesByPage],
  );
  // 첫 렌더의 상태 = 불러온 값. 저장에 성공한 키만 이 기준을 갱신한다.
  const [savedSnapshot, setSavedSnapshot] = useState(currentSnapshot);
  const hasUnsavedChanges = hasSnapshotChanges(savedSnapshot, currentSnapshot);

  // 저장하지 않은 변경이 있으면 새로고침·탭 닫기 전에 브라우저 경고를 띄운다.
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const resetSaveState = () => {
    setSaveMessage(null);
    setSaveError(null);
  };

  const persist = (changes: PendingChange[], successMessage: string) => {
    const keys = changes.map((change) => change.content_key);
    const sentSnapshot = pickSnapshotKeys(currentSnapshot, keys);
    const payload: ContentChange[] = changes.map((change) => ({
      ...change,
      base_value: baseValues[change.content_key],
    }));

    startTransition(async () => {
      const result = await savePageContentAction(payload);

      if (result.error) {
        // 충돌이면 서버가 "다른 관리자가 먼저 저장한 항목이 있습니다…"를 돌려준다.
        setSaveError(result.error);
        return;
      }

      setBaseValues((prev) => ({
        ...prev,
        ...Object.fromEntries(
          changes.map((change) => [change.content_key, change.value]),
        ),
      }));
      setSavedSnapshot((prev) => ({ ...prev, ...sentSnapshot }));
      setSaveMessage(successMessage);
    });
  };

  const saveGlobalLinks = () => {
    resetSaveState();

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

    persist(
      [
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
      ],
      "글로벌 링크를 저장했습니다.",
    );
  };

  const saveSections = () => {
    resetSaveState();

    const validationError = validateCustomSections(sections);
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    persist(
      [
        {
          content_key: `builder.${selectedPage}.customSections`,
          content_type: "list",
          value: JSON.stringify(sections),
          page: selectedPage,
          section: "builder",
        },
      ],
      "커스텀 섹션을 저장했습니다.",
    );
  };

  const saveExistingSections = () => {
    resetSaveState();

    const sectionIds = existingSections.map((section) => section.id);

    persist(
      [
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
      ],
      "기존 섹션 설정을 저장했습니다.",
    );
  };

  return {
    isPending,
    saveMessage,
    saveError,
    hasUnsavedChanges,
    saveGlobalLinks,
    saveSections,
    saveExistingSections,
  };
}
