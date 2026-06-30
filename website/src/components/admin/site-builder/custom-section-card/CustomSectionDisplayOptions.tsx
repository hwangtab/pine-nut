import type { CustomSection } from "@/lib/custom-sections";
import type { UpdateCustomSection } from "./types";

interface CustomSectionDisplayOptionsProps {
  section: CustomSection;
  updateSection: UpdateCustomSection;
}

const controlClassName =
  "rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]";

export default function CustomSectionDisplayOptions({
  section,
  updateSection,
}: CustomSectionDisplayOptionsProps) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
      <select
        value={section.theme}
        onChange={(event) =>
          updateSection("theme", event.target.value as CustomSection["theme"])
        }
        className={controlClassName}
      >
        <option value="paper">화이트</option>
        <option value="sand">웜</option>
        <option value="forest">포레스트</option>
      </select>
      <select
        value={section.align}
        onChange={(event) =>
          updateSection("align", event.target.value as CustomSection["align"])
        }
        className={controlClassName}
      >
        <option value="left">좌측 정렬</option>
        <option value="center">중앙 정렬</option>
      </select>
      <label className="flex items-center gap-3 rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-admin-text)]">
        <input
          type="checkbox"
          checked={section.visible}
          onChange={(event) => updateSection("visible", event.target.checked)}
        />
        표시
      </label>
    </div>
  );
}
