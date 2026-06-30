"use client";

import { useState } from "react";
import type { BuilderPageId } from "@/lib/custom-sections";
import {
  createInitialFooterLinks,
  createInitialNavLinks,
  createInitialSectionOrdersByPage,
  createInitialSectionStylesByPage,
  createInitialSectionsByPage,
  type SiteBuilderInitialValues,
} from "./state/initial-site-builder-state";
import { useSiteBuilderPersistence } from "./state/useSiteBuilderPersistence";
import { useSiteBuilderSelection } from "./state/useSiteBuilderSelection";

export default function useSiteBuilderState(
  initialValues: SiteBuilderInitialValues,
) {
  const [selectedPage, setSelectedPage] = useState<BuilderPageId>("home");
  const [navLinks, setNavLinks] = useState(() =>
    createInitialNavLinks(initialValues),
  );
  const [footerLinks, setFooterLinks] = useState(() =>
    createInitialFooterLinks(initialValues),
  );
  const [sectionsByPage, setSectionsByPage] = useState(() =>
    createInitialSectionsByPage(initialValues),
  );
  const [sectionOrdersByPage, setSectionOrdersByPage] = useState(() =>
    createInitialSectionOrdersByPage(initialValues),
  );
  const [sectionStylesByPage, setSectionStylesByPage] = useState(() =>
    createInitialSectionStylesByPage(initialValues),
  );

  const selection = useSiteBuilderSelection({
    selectedPage,
    sectionsByPage,
    sectionOrdersByPage,
    sectionStylesByPage,
  });
  const persistence = useSiteBuilderPersistence({
    navLinks,
    footerLinks,
    selectedPage,
    sections: selection.sections,
    existingSections: selection.existingSections,
    currentSectionOrder: selection.currentSectionOrder,
    currentSectionStyles: selection.currentSectionStyles,
  });

  return {
    ...persistence,
    selectedPage,
    setSelectedPage,
    selectedPageMeta: selection.selectedPageMeta,
    previewPath: selection.previewPath,
    navLinks,
    setNavLinks,
    footerLinks,
    setFooterLinks,
    sections: selection.sections,
    setSectionsByPage,
    existingSections: selection.existingSections,
    currentSectionOrder: selection.currentSectionOrder,
    currentSectionStyles: selection.currentSectionStyles,
    setSectionOrdersByPage,
    setSectionStylesByPage,
  };
}
