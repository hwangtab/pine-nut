"use client";

import { EditableText } from "@/components/editable";

interface PressSectionHeadingProps {
  contentKey: string;
  defaultValue: string;
  section: string;
  accent?: "forest" | "warm" | "sky";
  className?: string;
}

const accentClassNames = {
  forest: "bg-[var(--color-forest)]",
  warm: "bg-[var(--color-warm)]",
  sky: "bg-[var(--color-sky)]",
};

export default function PressSectionHeading({
  contentKey,
  defaultValue,
  section,
  accent = "forest",
  className = "mb-3",
}: PressSectionHeadingProps) {
  return (
    <h2 className={`text-lg font-bold text-[var(--color-text)] ${className} flex items-center gap-2`}>
      <span className={`w-1.5 h-6 ${accentClassNames[accent]} rounded-full inline-block`} />
      <EditableText
        contentKey={contentKey}
        defaultValue={defaultValue}
        as="span"
        page="press"
        section={section}
      />
    </h2>
  );
}
