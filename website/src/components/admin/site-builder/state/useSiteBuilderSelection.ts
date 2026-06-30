"use client";

import { useMemo } from "react";
import {
  BUILDER_PAGES,
  EXISTING_PAGE_SECTIONS,
  type BuilderPageId,
} from "@/lib/custom-sections";
import { PAGE_PREVIEW_PATHS } from "./preview-paths";
import type {
  SectionOrdersByPage,
  SectionStylesByPage,
  SectionsByPage,
} from "./initial-site-builder-state";

interface UseSiteBuilderSelectionInput {
  selectedPage: BuilderPageId;
  sectionsByPage: SectionsByPage;
  sectionOrdersByPage: SectionOrdersByPage;
  sectionStylesByPage: SectionStylesByPage;
}

export function useSiteBuilderSelection({
  selectedPage,
  sectionsByPage,
  sectionOrdersByPage,
  sectionStylesByPage,
}: UseSiteBuilderSelectionInput) {
  const sections = useMemo(
    () => sectionsByPage[selectedPage] ?? [],
    [sectionsByPage, selectedPage],
  );

  const selectedPageMeta = BUILDER_PAGES.find((page) => page.id === selectedPage);
  const existingSections = EXISTING_PAGE_SECTIONS[selectedPage] ?? [];
  const currentSectionOrder = sectionOrdersByPage[selectedPage] ?? [];
  const currentSectionStyles = sectionStylesByPage[selectedPage] ?? {};
  const previewPath = PAGE_PREVIEW_PATHS[selectedPage];

  return {
    sections,
    selectedPageMeta,
    existingSections,
    currentSectionOrder,
    currentSectionStyles,
    previewPath,
  };
}
