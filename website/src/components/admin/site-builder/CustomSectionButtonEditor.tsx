"use client";

import type { CustomSectionButton } from "@/lib/custom-sections";

interface CustomSectionButtonEditorProps {
  title: string;
  button: CustomSectionButton;
  onChange: (button: CustomSectionButton) => void;
}

export default function CustomSectionButtonEditor({
  title,
  button,
  onChange,
}: CustomSectionButtonEditorProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-admin-border)] bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-[var(--color-admin-muted)]">
        {title}
      </div>
      <div className="space-y-3">
        <input
          value={button.label}
          onChange={(event) =>
            onChange({
              ...button,
              label: event.target.value,
            })
          }
          className="w-full rounded-xl border border-[var(--color-admin-border)] px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
          placeholder="버튼 텍스트"
        />
        <input
          value={button.href}
          onChange={(event) =>
            onChange({
              ...button,
              href: event.target.value,
            })
          }
          className="w-full rounded-xl border border-[var(--color-admin-border)] px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
          placeholder="/petition 또는 https://..."
        />
      </div>
    </div>
  );
}
