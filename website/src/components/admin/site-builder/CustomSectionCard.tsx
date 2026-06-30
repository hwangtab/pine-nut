"use client";

import type { Dispatch, SetStateAction } from "react";
import CustomSectionButtonEditor from "@/components/admin/site-builder/CustomSectionButtonEditor";
import CustomSectionCardActions from "@/components/admin/site-builder/custom-section-card/CustomSectionCardActions";
import CustomSectionDisplayOptions from "@/components/admin/site-builder/custom-section-card/CustomSectionDisplayOptions";
import CustomSectionMediaFields from "@/components/admin/site-builder/custom-section-card/CustomSectionMediaFields";
import CustomSectionTextFields from "@/components/admin/site-builder/custom-section-card/CustomSectionTextFields";
import { useCustomSectionCardActions } from "@/components/admin/site-builder/custom-section-card/useCustomSectionCardActions";
import type { BuilderPageId, CustomSection } from "@/lib/custom-sections";

interface CustomSectionCardProps {
  section: CustomSection;
  index: number;
  totalCount: number;
  selectedPage: BuilderPageId;
  setSectionsByPage: Dispatch<SetStateAction<Record<BuilderPageId, CustomSection[]>>>;
}

export default function CustomSectionCard({
  section,
  index,
  totalCount,
  selectedPage,
  setSectionsByPage,
}: CustomSectionCardProps) {
  const {
    updateSection,
    duplicateSection,
    moveSectionUp,
    moveSectionDown,
    deleteSection,
  } = useCustomSectionCardActions({
    section,
    index,
    selectedPage,
    setSectionsByPage,
  });

  return (
    <div className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-bg)] p-5">
      <CustomSectionCardActions
        title={section.title || "새 섹션"}
        index={index}
        totalCount={totalCount}
        onDuplicate={duplicateSection}
        onMoveUp={moveSectionUp}
        onMoveDown={moveSectionDown}
        onDelete={deleteSection}
      />
      <CustomSectionTextFields
        section={section}
        updateSection={updateSection}
      />
      <CustomSectionMediaFields
        section={section}
        updateSection={updateSection}
      />
      <CustomSectionDisplayOptions
        section={section}
        updateSection={updateSection}
      />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <CustomSectionButtonEditor
          title="기본 버튼"
          button={section.primaryButton}
          onChange={(button) => updateSection("primaryButton", button)}
        />
        <CustomSectionButtonEditor
          title="보조 버튼"
          button={section.secondaryButton}
          onChange={(button) => updateSection("secondaryButton", button)}
        />
      </div>
    </div>
  );
}
