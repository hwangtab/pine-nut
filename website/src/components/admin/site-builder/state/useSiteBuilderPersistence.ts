"use client";

import { useState, useTransition } from "react";
import { savePageContentAction } from "@/lib/actions/page-content";
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

interface ExistingSectionMeta {
  id: string;
}

interface UseSiteBuilderPersistenceInput {
  navLinks: BuilderLinkItem[];
  footerLinks: BuilderLinkItem[];
  selectedPage: BuilderPageId;
  sections: CustomSection[];
  existingSections: ExistingSectionMeta[];
  currentSectionOrder: string[];
  currentSectionStyles: Record<string, ExistingSectionStyle>;
}

export function useSiteBuilderPersistence({
  navLinks,
  footerLinks,
  selectedPage,
  sections,
  existingSections,
  currentSectionOrder,
  currentSectionStyles,
}: UseSiteBuilderPersistenceInput) {
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const resetSaveState = () => {
    setSaveMessage(null);
    setSaveError(null);
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
    resetSaveState();

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
    resetSaveState();

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

  return {
    isPending,
    saveMessage,
    saveError,
    saveGlobalLinks,
    saveSections,
    saveExistingSections,
  };
}
