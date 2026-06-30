"use client";

import { EditableRichText } from "@/components/editable";

interface PressRichCalloutProps {
  contentKey: string;
  defaultValue: string;
  section: string;
  className?: string;
}

export default function PressRichCallout({
  contentKey,
  defaultValue,
  section,
  className = "text-base text-[var(--color-text)] leading-relaxed font-medium",
}: PressRichCalloutProps) {
  return (
    <section className="mb-8">
      <div className="bg-[var(--color-bg-warm)] rounded-xl p-5 border border-[var(--color-border)]">
        <EditableRichText contentKey={contentKey} defaultValue={defaultValue} page="press" section={section}>
          {(value) => <p className={className}>{value}</p>}
        </EditableRichText>
      </div>
    </section>
  );
}
