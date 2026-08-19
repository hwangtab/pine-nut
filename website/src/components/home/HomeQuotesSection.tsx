"use client";

import { EditableList, EditableText } from "@/components/editable";
import { FadeIn } from "@/components/home/HomeMotion";

export default function HomeQuotesSection() {
  return (
    <div className="max-w-4xl mx-auto">
      <FadeIn className="mb-16">
        <EditableText
          contentKey="home.quotes.heading"
          defaultValue="주민들의 목소리"
          as="h2"
          page="home"
          section="quotes"
          className="font-serif-display font-bold text-3xl sm:text-4xl md:text-5xl mb-4 text-[var(--color-text)]"
        />
        <EditableText
          contentKey="home.quotes.subtitle"
          defaultValue="이 땅에서 한평생을 살아온 사람들이, 직접 건네는 이야기"
          as="p"
          page="home"
          section="quotes"
          className="text-balance text-[var(--color-text-muted)] text-lg"
        />
      </FadeIn>

      <EditableList
        contentKey="home.quotes.items"
        defaultItems={[
          {
            quote: "100년 된 잣나무 숲, 야생동물, 마을 공동체 모두 지키고 싶어요.",
            name: "허순이 주민",
          },
          {
            quote: "매주 군청 앞에 섭니다. 우리가 아니면 누가 이 숲을 지킵니까.",
            name: "풍천리 주민",
          },
          {
            quote: "퇴거불응 혐의로 벌금 300만원을 구형받았습니다. 70 평생 남에게 해를 끼친 적 없는 사람이, 내 땅을 지키겠다는 이유로.",
            name: "기소된 주민",
          },
        ]}
        page="home"
        section="quotes"
        fields={[
          { key: "quote", label: "인용문", type: "textarea" },
          { key: "name", label: "이름" },
        ]}
      >
        {(items) => (
          <div className="space-y-10 md:space-y-12">
            {items.map((item, i) => (
              <FadeIn key={item.name} delay={i * 0.15}>
                <blockquote className={`paper ${i % 2 === 0 ? "paper-tilt-l" : "paper-tilt-r"} p-8 md:p-10`}>
                  <div className="relative z-[1]">
                    <span className="font-serif-display text-6xl leading-none text-[var(--color-forest)]/25 select-none" aria-hidden="true">
                      {"\u201C"}
                    </span>
                    <p className="font-serif-display text-xl sm:text-2xl md:text-[1.7rem] leading-relaxed text-[var(--color-text)] mt-2 mb-5">
                      {item.quote}
                    </p>
                    <footer className="font-hand text-2xl text-[var(--color-text-muted)] text-right">
                      — {item.name}
                    </footer>
                  </div>
                </blockquote>
              </FadeIn>
            ))}
          </div>
        )}
      </EditableList>
    </div>
  );
}
