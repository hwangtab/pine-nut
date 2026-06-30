import type { CustomSection } from "@/lib/custom-sections";
import type { UpdateCustomSection } from "./types";

interface CustomSectionMediaFieldsProps {
  section: CustomSection;
  updateSection: UpdateCustomSection;
}

const inputClassName =
  "rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]";

export default function CustomSectionMediaFields({
  section,
  updateSection,
}: CustomSectionMediaFieldsProps) {
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <input
        value={section.imageUrl}
        onChange={(event) => updateSection("imageUrl", event.target.value)}
        className={inputClassName}
        placeholder="이미지 URL"
      />
      <input
        value={section.imageAlt}
        onChange={(event) => updateSection("imageAlt", event.target.value)}
        className={inputClassName}
        placeholder="이미지 대체 텍스트"
      />
    </div>
  );
}
