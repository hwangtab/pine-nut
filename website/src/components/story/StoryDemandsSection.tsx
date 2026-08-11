"use client";

import { EditableList, EditableText } from "@/components/editable";

export function StoryDemandsSection() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
      <div className="max-w-3xl mx-auto">
        <EditableText
          contentKey="story.demands.heading"
          defaultValue="우리가 요구하는 것"
          as="h2"
          page="story"
          section="demands"
          className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10"
        />
        <EditableList
          contentKey="story.demands.items"
          defaultItems={[
            { text: "양수발전소 건설 계획 전면 백지화" },
            { text: "2025년 8월 29일 산업통상자원부 실시계획인가 고시(제2025-151호) 취소" },
            { text: "잣나무 숲과 생태계 보전" },
            { text: "주민 생존권 보장" },
          ]}
          page="story"
          section="demands"
          fields={[{ key: "text", label: "내용" }]}
        >
          {(items) => (
            <ul className="space-y-4 mb-16">
              {items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-4 text-base md:text-lg text-[var(--color-text)]"
                >
                  <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-forest)]/10 text-[var(--color-forest)] flex items-center justify-center font-bold text-sm mt-0.5">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          )}
        </EditableList>
        <blockquote className="border-l-4 border-[var(--color-forest)] pl-6 md:pl-8 py-2">
          <EditableText
            contentKey="story.demands.quote"
            defaultValue="“우리는 우리의 숲, 우리의 마을, 우리의 삶을 지키고 싶습니다.”"
            as="p"
            page="story"
            section="demands"
            className="text-xl md:text-2xl lg:text-3xl font-bold text-[var(--color-forest)] leading-snug"
          />
        </blockquote>
      </div>
    </section>
  );
}
