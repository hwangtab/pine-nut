"use client";

import { useMemo } from "react";
import { EditableSection } from "@/components/editable";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { parseExistingSectionStyles } from "@/lib/custom-sections";

const THEME_CLASS_MAP = {
  default: "",
  paper: "!bg-white",
  warm: "!bg-[var(--color-bg-warm)]",
  mist: "!bg-[var(--color-bg)]",
} as const;

const SPACING_CLASS_MAP = {
  compact: "!py-16 md:!py-20",
  normal: "",
  relaxed: "!py-28 md:!py-36",
} as const;

interface ManagedSectionProps {
  page: string;
  sectionId: string;
  visibilityContentKey: string;
  section?: string;
  htmlId?: string;
  defaultClassName: string;
  children: React.ReactNode;
}

export default function ManagedSection({
  page,
  sectionId,
  visibilityContentKey,
  section,
  htmlId,
  defaultClassName,
  children,
}: ManagedSectionProps) {
  const { getContent } = useAdminEdit();

  const sectionStyle = useMemo(() => {
    const styles = parseExistingSectionStyles(
      getContent(`builder.${page}.sectionStyles`),
    );
    return styles[sectionId];
  }, [getContent, page, sectionId]);

  const className = [
    defaultClassName,
    THEME_CLASS_MAP[sectionStyle?.theme ?? "default"],
    SPACING_CLASS_MAP[sectionStyle?.spacing ?? "normal"],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <EditableSection
      contentKey={visibilityContentKey}
      page={page}
      section={section}
    >
      <section id={htmlId} className={className}>
        {children}
      </section>
    </EditableSection>
  );
}
