"use client";

import { EditableRichText, EditableSection, EditableText } from "@/components/editable";

interface PressContactSectionProps {
  section: string;
  visibilityContentKey: string;
  titleContentKey: string;
  titleDefaultValue: string;
  detailsContentKey: string;
  detailsDefaultValue: string;
  accent?: "forest" | "sky";
  titleMarginClassName?: string;
}

const accentClassNames = {
  forest: "bg-[var(--color-forest)]",
  sky: "bg-[var(--color-sky)]",
};

export default function PressContactSection({
  section,
  visibilityContentKey,
  titleContentKey,
  titleDefaultValue,
  detailsContentKey,
  detailsDefaultValue,
  accent = "forest",
  titleMarginClassName = "mb-3",
}: PressContactSectionProps) {
  return (
    <EditableSection contentKey={visibilityContentKey} page="press" section={section}>
      <section className="mb-8">
        <h2 className={`text-lg font-bold text-[var(--color-text)] ${titleMarginClassName} flex items-center gap-2`}>
          <span className={`w-1.5 h-6 ${accentClassNames[accent]} rounded-full inline-block`} />
          <EditableText
            contentKey={titleContentKey}
            defaultValue={titleDefaultValue}
            as="span"
            page="press"
            section={section}
          />
        </h2>
        <div className="bg-[var(--color-bg)] rounded-xl p-5 border border-[var(--color-border)]">
          <EditableRichText
            contentKey={detailsContentKey}
            defaultValue={detailsDefaultValue}
            page="press"
            section={section}
          >
            {(value) => (
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {value.split("\n").map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {i === 0 ? <strong>{line}</strong> : line}
                  </span>
                ))}
              </p>
            )}
          </EditableRichText>
        </div>
      </section>
    </EditableSection>
  );
}
