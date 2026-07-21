"use client";

import { EditableImage, EditableList, EditableText } from "@/components/editable";

export function StoryBattleSection() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg-warm)]">
      <div className="max-w-3xl mx-auto">
        <EditableText
          contentKey="story.battle.heading"
          defaultValue="주민들은 어떻게 싸워왔나"
          as="h2"
          page="story"
          section="battle"
          className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10"
        />
        <EditableList
          contentKey="story.battle.timeline"
          defaultItems={[
            {
              year: "2019",
              text: "풍천리양수발전소건설반대대책위원회를 결성했습니다. 이창후 총무, 허순이 주민 등이 중심이 되어 주민 만장일치로 건설 반대를 결의했습니다.",
            },
            {
              year: "매주",
              text: "홍천군청 앞에서 집회를 이어왔습니다. 비가 오나 눈이 오나, 무더위와 한파 속에서도 쉬지 않았습니다. 2025년 말 기준 680여 차.",
            },
            {
              year: "2024.7",
              text: "홍천군청 2층에서 경찰과 대치하는 사건이 발생했습니다. 이 과정에서 7명의 주민(60~80대)이 퇴거불응 혐의로 기소되어, 벌금 200~300만원이 구형되었습니다. 총 1,800만원.",
            },
            {
              year: "연대",
              text: "전국 140여 개 단체가 연대했습니다. 양수발전소신규건설반대전국네트워크, 기독교환경운동연대, 원주녹색연합, 청소년직접행동 등이 함께하고 있습니다.",
            },
            {
              year: "상경",
              text: "국회와 정부 청사 앞까지 올라가 목소리를 냈습니다. 서울까지 몇 시간이 걸리는 길을, 60~80대 어르신들이 버스를 타고 오갔습니다.",
            },
            {
              year: "원칙",
              text: "모든 투쟁은 민주적 절차에 따른 합법적 방법으로 이루어졌습니다. 주민들은 폭력이 아니라 목소리로 싸웠습니다.",
            },
          ]}
          page="story"
          section="battle"
          fields={[
            { key: "year", label: "시기" },
            { key: "text", label: "내용", type: "textarea" },
          ]}
        >
          {(items) => (
            <div className="space-y-8">
              {items.map((item, index) => (
                <div key={index} className="flex gap-5 md:gap-8">
                  <div className="shrink-0 w-20 md:w-24">
                    <span className="inline-block bg-[var(--color-forest)] text-white text-xs md:text-sm font-bold px-2 md:px-3 py-1.5 rounded-full whitespace-nowrap">
                      {item.year}
                    </span>
                  </div>
                  <p className="text-[var(--color-text)] leading-relaxed text-base md:text-lg pt-0.5 [overflow-wrap:anywhere]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </EditableList>

        <div className="mt-12 space-y-8">
          <div>
            <EditableImage
              contentKey="story.battle.photo1"
              defaultSrc="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535381_STD.jpg"
              alt="풍천리 주민들의 대통령실 앞 기자회견 현장"
              page="story"
              section="battle"
              width={1200}
              height={800}
              className="w-full rounded-[var(--radius-card)] shadow-card my-6"
            />
            <EditableText
              contentKey="story.battle.photo1Caption"
              defaultValue="사진: 오마이뉴스"
              as="p"
              page="story"
              section="battle"
              className="text-xs text-[var(--color-text-muted)] mt-1"
            />
          </div>
          <div>
            <EditableImage
              contentKey="story.battle.photo2"
              defaultSrc="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535384_STD.jpg"
              alt="풍천리 마을에 설치된 양수발전소 반대 플래카드"
              page="story"
              section="battle"
              width={1200}
              height={800}
              className="w-full rounded-[var(--radius-card)] shadow-card my-6"
            />
            <EditableText
              contentKey="story.battle.photo2Caption"
              defaultValue="사진: 오마이뉴스"
              as="p"
              page="story"
              section="battle"
              className="text-xs text-[var(--color-text-muted)] mt-1"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
