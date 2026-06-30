"use client";

import type { Dispatch, SetStateAction } from "react";
import { moveItem } from "@/components/admin/site-builder/move-item";
import {
  createEmptyCustomSection,
  type BuilderPageId,
  type CustomSection,
} from "@/lib/custom-sections";
import type { UpdateCustomSection } from "./types";

interface UseCustomSectionCardActionsInput {
  section: CustomSection;
  index: number;
  selectedPage: BuilderPageId;
  setSectionsByPage: Dispatch<SetStateAction<Record<BuilderPageId, CustomSection[]>>>;
}

export function useCustomSectionCardActions({
  section,
  index,
  selectedPage,
  setSectionsByPage,
}: UseCustomSectionCardActionsInput) {
  const updateSection: UpdateCustomSection = (field, value) => {
    setSectionsByPage((prev) => ({
      ...prev,
      [selectedPage]: (prev[selectedPage] ?? []).map((prevSection) =>
        prevSection.id === section.id
          ? { ...prevSection, [field]: value }
          : prevSection,
      ),
    }));
  };

  const duplicateSection = () => {
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
    });
  };

  const moveSection = (direction: -1 | 1) => {
    setSectionsByPage((prev) => ({
      ...prev,
      [selectedPage]: moveItem(prev[selectedPage] ?? [], index, direction),
    }));
  };

  const deleteSection = () => {
    setSectionsByPage((prev) => ({
      ...prev,
      [selectedPage]: (prev[selectedPage] ?? []).filter(
        (prevSection) => prevSection.id !== section.id,
      ),
    }));
  };

  return {
    updateSection,
    duplicateSection,
    moveSectionUp: () => moveSection(-1),
    moveSectionDown: () => moveSection(1),
    deleteSection,
  };
}
