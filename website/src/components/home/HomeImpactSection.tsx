"use client";

import { EditableList, EditableText } from "@/components/editable";
import { FadeIn } from "@/components/home/HomeMotion";

const gradients = [
  "from-emerald-600 to-green-800",
  "from-gray-500 to-gray-700",
  "from-amber-700 to-yellow-900",
  "from-amber-500 to-orange-700",
];

const svgIcons = [
  <svg key="eco" viewBox="0 0 64 64" fill="none" className="w-14 h-14" aria-hidden="true">
    <path d="M32 6L18 26h6L14 44h8L10 58h44L42 44h8L40 26h6L32 6z" fill="white" fillOpacity="0.9" />
    <rect x="29" y="54" width="6" height="10" rx="1" fill="white" fillOpacity="0.7" />
  </svg>,
  <svg key="noise" viewBox="0 0 64 64" fill="none" className="w-14 h-14" aria-hidden="true">
    <path d="M10 28v8h8l12 12V16L18 28H10z" fill="white" fillOpacity="0.9" />
    <path d="M38 20a12 12 0 010 24" stroke="white" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
    <path d="M42 14a20 20 0 010 36" stroke="white" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="18" r="2" fill="white" fillOpacity="0.4" />
    <circle cx="54" cy="28" r="1.5" fill="white" fillOpacity="0.3" />
    <circle cx="52" cy="40" r="2.5" fill="white" fillOpacity="0.35" />
    <circle cx="48" cy="48" r="1.5" fill="white" fillOpacity="0.3" />
  </svg>,
  <svg key="community" viewBox="0 0 64 64" fill="none" className="w-14 h-14" aria-hidden="true">
    <path d="M8 38L32 18l24 20H8z" fill="white" fillOpacity="0.9" />
    <rect x="16" y="38" width="32" height="18" fill="white" fillOpacity="0.9" />
    <rect x="26" y="42" width="12" height="14" rx="1" fill="currentColor" fillOpacity="0.3" />
    <line x1="18" y1="16" x2="46" y2="52" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
    <line x1="46" y1="16" x2="18" y2="52" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
  </svg>,
  <svg key="livelihood" viewBox="0 0 64 64" fill="none" className="w-14 h-14" aria-hidden="true">
    <ellipse cx="32" cy="40" rx="18" ry="14" fill="white" fillOpacity="0.9" />
    <ellipse cx="32" cy="32" rx="18" ry="6" fill="white" fillOpacity="0.7" />
    <path d="M24 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="white" strokeOpacity="0.8" strokeWidth="3" strokeLinecap="round" />
    <line x1="14" y1="14" x2="50" y2="54" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
  </svg>,
];

export default function HomeImpactSection() {
  return (
    <div className="max-w-5xl mx-auto">
      <FadeIn className="text-center mb-16">
        <EditableText
          contentKey="home.impact.heading"
          defaultValue="무엇이 이 숲을 위협하나요?"
          as="h2"
          page="home"
          section="impact"
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-4"
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
                <div className="bg-white rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-card h-full overflow-hidden">
                  <div className={`w-full h-48 bg-gradient-to-br ${gradients[i] || gradients[0]} flex items-center justify-center`}>
                    {svgIcons[i] || svgIcons[0]}
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                      {card.desc}
                    </p>
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
