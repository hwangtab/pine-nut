"use client";

import { EditableImage, EditableList, EditableText } from "@/components/editable";
import { FadeIn } from "@/components/home/HomeMotion";

const icons = [
  <svg key="prayer" viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
    <path d="M24 4C24 4 14 18 14 26a10 10 0 0020 0C34 18 24 4 24 4z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 18v12M20 28l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
  </svg>,
  <svg key="solidarity" viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
    <circle cx="24" cy="16" r="6" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <circle cx="12" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />
    <circle cx="36" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />
    <path d="M16 34c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M6 36c0-3.3 2.7-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
    <path d="M42 36c0-3.3-2.7-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
  </svg>,
  <svg key="award" viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
    <polygon points="24,4 29,18 44,18 32,27 36,42 24,33 12,42 16,27 4,18 19,18" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
  </svg>,
];

export default function HomeHopeSection() {
  return (
    <div className="max-w-5xl mx-auto">
      <FadeIn className="text-center mb-6">
        <EditableText
          contentKey="home.hope.eyebrow"
          defaultValue="그러나 이야기는 여기서 끝나지 않습니다"
          as="p"
          page="home"
          section="hope"
          className="text-sm font-semibold tracking-widest uppercase text-[var(--color-forest)] opacity-60 mb-4"
        />
        <EditableText
          contentKey="home.hope.heading"
          defaultValue="그럼에도, 포기하지 않았습니다"
          as="h2"
          page="home"
          section="hope"
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 text-[var(--color-forest)]"
        />
        <EditableText
          contentKey="home.hope.subtitle"
          defaultValue="7년간 705번. 일흔 넘은 어르신들이 매주 버스에 올라 홍천군청 앞에 섰습니다. 지팡이를 짚고서라도, 단 한 주도 거르지 않았습니다."
          as="p"
          page="home"
          section="hope"
          className="text-balance text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-2xl mx-auto"
        />
      </FadeIn>

      <EditableList
        contentKey="home.hope.cards"
        defaultItems={[
          {
            title: "672차 기도회",
            desc: "비가 오나 눈이 오나, 매주 한자리에 모여 평화로운 기도를 이어왔습니다.",
          },
          {
            title: "140개 단체 연대",
            desc: "전국 140개 환경·시민단체가 풍천리의 손을 맞잡았습니다.",
          },
          {
            title: "시민공모전 대상",
            desc: "한국내셔널트러스트 '이곳만은 지키자' 공모전 대상. 지켜야 할 가치를 온 사회가 함께 인정했습니다.",
          },
        ]}
        page="home"
        section="hope"
        fields={[
          { key: "title", label: "제목" },
          { key: "desc", label: "설명", type: "textarea" },
        ]}
      >
        {(items) => (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mt-14">
            {items.map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.1}>
                <div className="bg-white rounded-[var(--radius-card)] p-8 border border-[var(--color-border)] text-center h-full flex flex-col items-center shadow-card">
                  <div className="text-[var(--color-forest)] mb-5">
                    {icons[i] || icons[0]}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </EditableList>

      <FadeIn delay={0.3}>
        <div className="mt-14">
          <EditableImage
            contentKey="home.hope.protestPhoto"
            defaultSrc="https://www.pressian.com/_resources/10/2025/11/12/2025111117101271238_l.png"
            alt="672차 결의대회 사진"
            page="home"
            section="hope"
            width={1200}
            height={800}
            className="w-full rounded-[var(--radius-card)] border border-black/5 shadow-card"
          />
          <EditableText
            contentKey="home.hope.protestPhotoCredit"
            defaultValue="사진: 풍천리양수발전소반대대책위 / 프레시안"
            as="p"
            page="home"
            section="hope"
            className="text-xs text-[var(--color-text-muted)] mt-2"
          />
        </div>
      </FadeIn>
    </div>
  );
}
