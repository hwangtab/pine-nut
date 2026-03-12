"use client";

import { EditableList } from "@/components/editable";

const factSheetData = [
  { label: "위치", value: "강원도 홍천군 화촌면 풍천리" },
  { label: "사업자", value: "한국수력원자력(한수원)" },
  { label: "시공자", value: "대우건설 컨소시엄" },
  { label: "시설 규모", value: "600MW (300MW × 2기)" },
  { label: "사업 면적", value: "1,530,279㎡ (약 153ha)" },
  { label: "총 사업비", value: "1조 5,863억원" },
  { label: "벌채 예정 잣나무", value: "약 11만 그루" },
  { label: "잣나무 숲", value: "1,800ha (산림청 지정 '100대 명품숲')" },
  { label: "수몰 가구", value: "51가구" },
  { label: "주민 생계", value: "약 70%가 잣 생산으로 생계 유지" },
  { label: "멸종위기종", value: "산양(천연기념물), 까막딱다구리, 수달 서식" },
  { label: "투쟁 기간", value: "2019년 3월 ~ 현재 (7년+)" },
  { label: "집회 횟수", value: "680회 이상" },
  { label: "주민 참여", value: "만장일치 반대" },
  {
    label: "주요 쟁점",
    value: "생태계 파괴, 소음·분진, 잣 생산지 소멸, 공동체 와해",
  },
];

export function PressFactsSection() {
  return (
    <EditableList
      contentKey="press.facts.items"
      defaultItems={factSheetData}
      page="press"
      section="facts"
      fields={[
        { key: "label", label: "항목" },
        { key: "value", label: "내용" },
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
                <dt className="text-sm font-bold text-[var(--color-text-muted)] sm:w-36 shrink-0">
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
