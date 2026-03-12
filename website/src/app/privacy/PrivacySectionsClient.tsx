"use client";

import { EditableList } from "@/components/editable";

const privacyPurposeItems = [
  { text: "서명 접수 및 서명 현황 관리" },
  { text: "웹사이트 이용 통계 분석을 통한 서비스 개선" },
];

const rightsItems = [
  { text: "개인정보 열람 요구" },
  { text: "오류 등이 있는 경우 정정 요구" },
  { text: "삭제 요구" },
  { text: "처리 정지 요구" },
];

export function PrivacyPurposeList() {
  return (
    <EditableList
      contentKey="privacy.section2.items"
      defaultItems={privacyPurposeItems}
      page="privacy"
      section="section2"
      fields={[{ key: "text", label: "목적" }]}
    >
      {(items) => (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-[var(--color-text)] text-[15px] leading-relaxed"
            >
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

export function PrivacyRightsList() {
  return (
    <EditableList
      contentKey="privacy.section5.items"
      defaultItems={rightsItems}
      page="privacy"
      section="section5"
      fields={[{ key: "text", label: "권리" }]}
    >
      {(items) => (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-3 text-[var(--color-text)] text-[15px]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-forest)] shrink-0" />
              {item.text}
            </li>
          ))}
        </ul>
      )}
    </EditableList>
  );
}
