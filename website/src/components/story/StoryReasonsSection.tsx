"use client";

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
          className="font-serif-display text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-12"
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
          {(items) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {items.map((item, index) => (
                <div key={index} className="paper h-full p-8">
                  <div className="relative z-[1]">
                    <span
                      aria-hidden="true"
                      className="font-serif-display text-sm font-bold tracking-[0.25em] text-[var(--color-forest)]"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-serif-display font-bold text-2xl mt-3 mb-4 text-[var(--color-text)]">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-[var(--color-text)]/85">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </EditableList>

        <div className="mt-12 max-w-3xl mx-auto">
          <figure className="photo-frame paper-tilt-l">
            <EditableImage
              contentKey="story.reasons.photo"
              defaultSrc="https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/ie003535385_std.jpg"
              alt="이설 공사로 훼손되고 있는 가리산 현장"
              page="story"
              section="reasons"
              width={1200}
              height={800}
              className="w-full rounded-[2px]"
            />
            <figcaption>
              <EditableText
                contentKey="story.reasons.photoCaption"
                defaultValue="사진: 오마이뉴스"
                as="p"
                page="story"
                section="reasons"
                className="font-hand text-lg text-[var(--color-text-muted)] mt-2 text-right pr-1"
              />
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
