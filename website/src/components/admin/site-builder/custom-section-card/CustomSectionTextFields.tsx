import type { CustomSection } from "@/lib/custom-sections";
import type { UpdateCustomSection } from "./types";

interface CustomSectionTextFieldsProps {
  section: CustomSection;
  updateSection: UpdateCustomSection;
}

const inputClassName =
  "rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]";

export default function CustomSectionTextFields({
  section,
  updateSection,
}: CustomSectionTextFieldsProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={section.eyebrow}
          onChange={(event) => updateSection("eyebrow", event.target.value)}
          className={inputClassName}
          placeholder="상단 작은 제목"
        />
        <input
          value={section.title}
          onChange={(event) => updateSection("title", event.target.value)}
          className={inputClassName}
          placeholder="섹션 제목"
        />
      </div>

      <textarea
        value={section.body}
        onChange={(event) => updateSection("body", event.target.value)}
        className="mt-4 min-h-32 w-full rounded-2xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base leading-relaxed text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
        placeholder="본문 설명"
      />
    </>
  );
}
