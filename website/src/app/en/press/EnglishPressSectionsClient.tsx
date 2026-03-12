"use client";

import { EditableList } from "@/components/editable";

const factSheetData = [
  { label: "Location", value: "Pungcheon-ri, Hongcheon County, Gangwon Province, South Korea" },
  { label: "Developer", value: "Korea Hydro & Nuclear Power (KHNP)" },
  { label: "Main contractor", value: "Daewoo E&C consortium" },
  { label: "Plant size", value: "600MW (300MW x 2 units)" },
  { label: "Project area", value: "1,530,279 square meters (about 153 hectares)" },
  { label: "Total budget", value: "1.5863 trillion KRW" },
  { label: "Pine trees at risk", value: "About 110,000 trees" },
  { label: "Pine forest", value: "1,800 hectares, designated as one of Korea's Top 100 Forests" },
  { label: "Households affected", value: "51 households facing submersion and relocation" },
  { label: "Livelihood reliance", value: "About 70% of residents rely on pine nut production" },
  { label: "Endangered species", value: "Goral, black woodpecker, and otter habitat" },
  { label: "Length of struggle", value: "March 2019 to present (7+ years)" },
  { label: "Weekly protests", value: "More than 680" },
  { label: "Resident position", value: "Unanimous opposition" },
  { label: "Core concerns", value: "Ecological destruction, dust and noise, livelihood loss, community breakup" },
];

export function EnglishPressFactsSection() {
  return (
    <EditableList
      contentKey="en.press.facts.items"
      defaultItems={factSheetData}
      page="en/press"
      section="facts"
      fields={[
        { key: "label", label: "Label" },
        { key: "value", label: "Value" },
      ]}
    >
      {(items) => (
        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
          <div className="divide-y divide-[var(--color-border)]">
            {items.map((fact) => (
              <div
                key={fact.label}
                className="flex flex-col sm:flex-row sm:items-center px-6 py-4 gap-1 sm:gap-4"
              >
                <dt className="text-sm font-bold text-[var(--color-text-muted)] sm:w-40 shrink-0">
                  {fact.label}
                </dt>
                <dd className="text-base text-[var(--color-text)] font-medium">
                  {fact.value}
                </dd>
              </div>
            ))}
          </div>
        </div>
      )}
    </EditableList>
  );
}
