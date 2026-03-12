"use client";

import { EditableList } from "@/components/editable";

const privacyPurposeItems = [
  { text: "To collect petition signatures and manage signature counts" },
  { text: "To improve the website through basic analytics on site usage" },
];

const rightsItems = [
  { text: "Request access to your personal information" },
  { text: "Request correction of inaccurate information" },
  { text: "Request deletion" },
  { text: "Request suspension of processing" },
];

export function EnglishPrivacyPurposeList() {
  return (
    <EditableList
      contentKey="en.privacy.section2.items"
      defaultItems={privacyPurposeItems}
      page="en/privacy"
      section="section2"
      fields={[{ key: "text", label: "Purpose" }]}
    >
      {(items) => (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-[var(--color-text)] text-[15px] leading-relaxed">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-forest)]/10 text-[var(--color-forest)] flex items-center justify-center font-bold text-xs mt-0.5">
                {index + 1}
              </span>
              {item.text}
            </li>
          ))}
        </ul>
      )}
    </EditableList>
  );
}

export function EnglishPrivacyRightsList() {
  return (
    <EditableList
      contentKey="en.privacy.section5.items"
      defaultItems={rightsItems}
      page="en/privacy"
      section="section5"
      fields={[{ key: "text", label: "Right" }]}
    >
      {(items) => (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-3 text-[var(--color-text)] text-[15px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-forest)] shrink-0" />
              {item.text}
            </li>
          ))}
        </ul>
      )}
    </EditableList>
  );
}
