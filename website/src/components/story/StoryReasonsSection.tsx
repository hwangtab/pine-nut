"use client";

import type { ReactNode } from "react";
import { EditableImage, EditableList, EditableText } from "@/components/editable";

export function StoryReasonsSection() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto">
        <EditableText
          contentKey="story.reasons.heading"
          defaultValue="왜 반대하는가"
          as="h2"
          page="story"
          section="reasons"
          className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-12 text-center"
        />
        <EditableList
          contentKey="story.reasons.cards"
          defaultItems={[
            {
              title: "생태계 파괴",
              description:
                "잣나무 약 11만 그루 벌채 예정. 1,800ha 명품숲이 파괴되고, 산양(천연기념물)·까막딱다구리·수달 등 멸종위기종 서식지가 영구적으로 파괴됩니다.",
              color: "forest",
              icon: "sparkle",
            },
            {
              title: "생계 위협",
              description:
                "주민 70%가 잣 생산으로 생계 유지. 이미 2024년 10월 이설도로 건설로 2,256그루(10.96ha) 벌채가 시작되었습니다.",
              color: "earth",
              icon: "money",
            },
            {
              title: "건강 위협",
              description:
                "대규모 공사(84개월 예정)로 인한 소음, 분진, 진동이 7년간 이어집니다. 60~80대 고령 주민들의 건강이 심각하게 악화될 수 있습니다.",
              color: "warm",
              icon: "heart",
            },
            {
              title: "공동체 와해",
              description:
                "51가구가 수몰·이주 예정. 수십 년간 함께해온 마을 공동체가 해체됩니다. 한 번 흩어지면 다시 모일 수 없습니다.",
              color: "sky",
              icon: "people",
            },
          ]}
          page="story"
          section="reasons"
          fields={[
            { key: "title", label: "제목" },
            { key: "description", label: "설명", type: "textarea" },
          ]}
        >
          {(items) => {
            const colorMap: Record<
              string,
              { border: string; bg: string; text: string }
            > = {
              forest: {
                border: "border-[var(--color-forest)]/15",
                bg: "bg-[var(--color-forest)]/10",
                text: "text-[var(--color-forest)]",
              },
              earth: {
                border: "border-[var(--color-earth)]/15",
                bg: "bg-[var(--color-earth)]/10",
                text: "text-[var(--color-earth)]",
              },
              warm: {
                border: "border-[var(--color-warm)]/15",
                bg: "bg-[var(--color-warm)]/10",
                text: "text-[var(--color-warm)]",
              },
              sky: {
                border: "border-[var(--color-sky)]/15",
                bg: "bg-[var(--color-sky)]/10",
                text: "text-[var(--color-sky)]",
              },
            };

            const iconMap: Record<string, ReactNode> = {
              sparkle: (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              ),
              money: (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              ),
              heart: (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              ),
              people: (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              ),
            };

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {items.map((item, index) => {
                  const color = colorMap[item.color] || colorMap.forest;

                  return (
                    <div
                      key={index}
                      className={`bg-white rounded-2xl p-8 border-2 ${color.border} shadow-sm`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center mb-5`}
                      >
                        <span className={color.text}>
                          {iconMap[item.icon] || iconMap.sparkle}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">
                        {item.title}
                      </h3>
                      <p className="text-[var(--color-text-muted)] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          }}
        </EditableList>

        <div className="mt-12 max-w-3xl mx-auto">
          <EditableImage
            contentKey="story.reasons.photo"
            defaultSrc="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535385_STD.jpg"
            alt="이설 공사로 훼손되고 있는 가리산 현장"
            page="story"
            section="reasons"
            width={1200}
            height={800}
            className="w-full rounded-xl shadow-lg my-6"
          />
          <EditableText
            contentKey="story.reasons.photoCaption"
            defaultValue="사진: 오마이뉴스"
            as="p"
            page="story"
            section="reasons"
            className="text-xs text-[var(--color-text-muted)] mt-1"
          />
        </div>
      </div>
    </section>
  );
}
