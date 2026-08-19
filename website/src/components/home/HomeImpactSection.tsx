"use client";

import { EditableList, EditableText } from "@/components/editable";
import { FadeIn } from "@/components/home/HomeMotion";

export default function HomeImpactSection() {
  return (
    <div className="max-w-5xl mx-auto">
      <FadeIn className="mb-16 max-w-3xl">
        <EditableText
          contentKey="home.impact.heading"
          defaultValue="무엇이 이 숲을 위협하나요?"
          as="h2"
          page="home"
          section="impact"
          className="font-serif-display font-bold text-3xl sm:text-4xl md:text-5xl mb-4 text-[var(--color-text)]"
        />
        <EditableText
          contentKey="home.impact.subtitle"
          defaultValue="양수발전소가 들어서는 순간, 마을과 숲이 잃게 될 것들"
          as="p"
          page="home"
          section="impact"
          className="text-balance text-lg text-[var(--color-text-muted)]"
        />
      </FadeIn>

      <EditableList
        contentKey="home.impact.cards"
        defaultItems={[
          {
            title: "생태계 파괴",
            desc: "잣나무 11만 그루가 잘려 나가고 153ha의 숲이 사라집니다. 산양과 까막딱다구리, 수달이 깃들던 마지막 보금자리도 함께 무너집니다.",
          },
          {
            title: "소음·분진",
            desc: "84개월, 꼬박 7년에 걸친 1조 5,900억 원 규모의 공사. 끊이지 않는 소음과 분진 속에서 어르신들의 하루하루가 위협받습니다.",
          },
          {
            title: "공동체 와해",
            desc: "51가구가 물에 잠기고, 정든 이웃들이 뿔뿔이 흩어집니다. 수십 년을 함께 나눈 마을 공동체가 통째로 사라집니다.",
          },
          {
            title: "생계 위협",
            desc: "주민 70%의 생계가 걸린 잣나무. 2024년 10월 이설도로 공사로 이미 2,256그루가 베어지며, 그 위협은 눈앞의 현실이 되었습니다.",
          },
        ]}
        page="home"
        section="impact"
        fields={[
          { key: "title", label: "제목" },
          { key: "desc", label: "설명", type: "textarea" },
        ]}
      >
        {(items) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {items.map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.1}>
                <div className="paper h-full p-8">
                  <div className="relative z-[1]">
                    <span className="font-serif-display text-sm font-bold tracking-[0.25em] text-[var(--color-forest)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-serif-display font-bold text-2xl mt-3 mb-4 text-[var(--color-text)]">
                      {card.title}
                    </h3>
                    <p className="leading-relaxed text-[var(--color-text)]/85">{card.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </EditableList>
    </div>
  );
}
