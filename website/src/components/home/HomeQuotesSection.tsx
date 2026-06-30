"use client";

import { EditableList, EditableText } from "@/components/editable";
import { FadeIn } from "@/components/home/HomeMotion";

export default function HomeQuotesSection() {
  return (
    <div className="max-w-4xl mx-auto">
      <FadeIn className="text-center mb-16">
        <EditableText
          contentKey="home.quotes.heading"
          defaultValue="주민들의 목소리"
          as="h2"
          page="home"
          section="quotes"
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-4"
        />
        <EditableText
          contentKey="home.quotes.subtitle"
          defaultValue="풍천리에서 평생을 살아온 사람들의 이야기"
          as="p"
          page="home"
          section="quotes"
          className="text-white/60 text-lg"
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
          <div className="space-y-12 md:space-y-16">
            {items.map((item, i) => (
              <FadeIn key={item.name} delay={i * 0.15}>
                <blockquote className="relative pl-8 md:pl-12">
                  <span
                    className="absolute top-0 left-0 text-6xl md:text-8xl font-serif leading-none text-white/20 select-none"
                    aria-hidden="true"
                  >
                    {"\u201C"}
                  </span>
                  <p className="text-xl sm:text-2xl md:text-3xl font-medium leading-relaxed mb-4">
                    {item.quote}
                  </p>
                  <footer className="text-white/50 text-base md:text-lg">
                    — {item.name}
                  </footer>
                </blockquote>
              </FadeIn>
            ))}
          </div>
        )}
      </EditableList>
    </div>
  );
}
