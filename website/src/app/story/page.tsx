import type { Metadata } from "next";
import Link from "next/link";
import SubHero from "@/components/SubHero";
import {
  EditableText,
  EditableImage,
  EditableRichText,
  EditableList,
  EditableSection,
} from "@/components/editable";

export const metadata: Metadata = {
  title: "풍천리 이야기 — 잣나무 숲과 마을을 지키려는 7년간의 싸움",
  description:
    "강원도 홍천군 풍천리 주민들이 양수발전소 건설에 맞서 마을과 자연을 지켜온 이야기를 전합니다.",
};

export default function StoryPage() {
  return (
    <article>
      {/* ── SubHero ── */}
      <EditableSection contentKey="story.hero.visibility" page="story" section="hero">
        <SubHero
          imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg"
          title={<EditableText contentKey="story.hero.title" defaultValue="풍천리 이야기" as="span" page="story" section="hero" />}
          subtitle={<EditableText contentKey="story.hero.subtitle" defaultValue="잣나무 숲과 마을을 지키려는 7년간의 싸움" as="span" page="story" section="hero" />}
          eyebrow="마을의 목소리"
        />
      </EditableSection>

      {/* ── 풍천리는 어떤 마을인가요 ── */}
      <EditableSection contentKey="story.village.visibility" page="story" section="village">
        <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
          <div className="max-w-3xl mx-auto">
            <EditableText
              contentKey="story.village.heading"
              defaultValue="풍천리는 어떤 마을인가요"
              as="h2"
              page="story"
              section="village"
              className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10"
            />
            <EditableRichText
              contentKey="story.village.body"
              defaultValue={`풍천리는 강원도 홍천군 화촌면에 자리한 작은 산촌 마을입니다. 산림청 지정 '100대 명품숲' 중 하나인 1,800ha 규모의 국내 최대 잣나무 숲에 둘러싸인 곳으로, 100년 된 잣나무들이 자라는 가리산 자락에 위치해 있습니다.\n\n주민의 약 70%가 잣 생산으로 생계를 유지하고 있습니다. 잣나무 숲은 단순한 풍경이 아니라, 가족을 먹여 살린 삶의 터전입니다.\n\n이 숲에는 산양(천연기념물), 까막딱다구리, 수달 등 멸종위기종이 서식하고 있습니다. 자연과 사람이 함께 숨 쉬며 살아온, 조용하고 평화로운 마을이었습니다.`}
              page="story"
              section="village"
              className="space-y-5 text-[var(--color-text)] leading-relaxed text-base md:text-lg"
            >
              {(value) => (
                <div className="space-y-5 text-[var(--color-text)] leading-relaxed text-base md:text-lg">
                  {value.split("\n\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
            </EditableRichText>
          </div>
        </section>
      </EditableSection>

      {/* ── 양수발전소란 무엇인가요 ── */}
      <EditableSection contentKey="story.plant.visibility" page="story" section="plant">
        <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg-warm)]">
          <div className="max-w-3xl mx-auto">
            <EditableText
              contentKey="story.plant.heading"
              defaultValue="양수발전소란 무엇인가요"
              as="h2"
              page="story"
              section="plant"
              className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10"
            />
            <EditableRichText
              contentKey="story.plant.body"
              defaultValue={`한국수력원자력(한수원)이 추진하는 600MW 규모(300MW × 2기) 양수발전소입니다. 산 위와 아래에 상·하부 댐을 건설하여, 전기가 남는 밤에 아래 저수지의 물을 위로 퍼올리고, 전기가 필요한 낮에 그 물을 다시 떨어뜨려 터빈을 돌리는 발전소입니다.\n\n총 사업비 1조 5,863억원, 사업 면적 약 153ha(1,530,279㎡)에 달하는 대규모 사업입니다. 시공은 대우건설 컨소시엄(대우건설, DL건설, 효성)이 6,155억원 규모로 맡고 있습니다.\n\n2019년 홍천군이 유치 신청하여 한수원이 후보지로 선정했습니다. 이 계획대로라면 51가구가 수몰·이주 예정이며, 잣나무들이 뿌리째 뽑히고 맑던 계곡물이 흙탕물로 변하게 됩니다.`}
              page="story"
              section="plant"
              className="space-y-5 text-[var(--color-text)] leading-relaxed text-base md:text-lg"
            >
              {(value) => (
                <div className="space-y-5 text-[var(--color-text)] leading-relaxed text-base md:text-lg">
                  {value.split("\n\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
            </EditableRichText>
          </div>
        </section>
      </EditableSection>

      {/* ── 왜 반대하는가 ── */}
      <EditableSection contentKey="story.reasons.visibility" page="story" section="reasons">
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
                const colorMap: Record<string, { border: string; bg: string; text: string }> = {
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
                const iconMap: Record<string, React.ReactNode> = {
                  sparkle: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  ),
                  money: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  ),
                  heart: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ),
                  people: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                };
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {items.map((item, i) => {
                      const c = colorMap[item.color] || colorMap.forest;
                      return (
                        <div key={i} className={`bg-white rounded-2xl p-8 border-2 ${c.border} shadow-sm`}>
                          <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-5`}>
                            <span className={c.text}>{iconMap[item.icon] || iconMap.sparkle}</span>
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

            {/* Evidence photo: construction damage */}
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
      </EditableSection>

      {/* ── 주민들은 어떻게 싸워왔나 ── */}
      <EditableSection contentKey="story.battle.visibility" page="story" section="battle">
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
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-5 md:gap-8">
                      <div className="shrink-0 w-16 md:w-20">
                        <span className="inline-block bg-[var(--color-forest)] text-white text-xs md:text-sm font-bold px-3 py-1.5 rounded-full">
                          {item.year}
                        </span>
                      </div>
                      <p className="text-[var(--color-text)] leading-relaxed text-base md:text-lg pt-0.5">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </EditableList>

            {/* Real protest photos */}
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
                  className="w-full rounded-xl shadow-lg my-6"
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
                  className="w-full rounded-xl shadow-lg my-6"
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
      </EditableSection>

      {/* ── 우리가 요구하는 것 ── */}
      <EditableSection contentKey="story.demands.visibility" page="story" section="demands">
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
                  {items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-4 text-base md:text-lg text-[var(--color-text)]"
                    >
                      <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-forest)]/10 text-[var(--color-forest)] flex items-center justify-center font-bold text-sm mt-0.5">
                        {i + 1}
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
                defaultValue={"\u201C우리는 우리의 숲, 우리의 마을, 우리의 삶을 지키고 싶습니다.\u201D"}
                as="p"
                page="story"
                section="demands"
                className="text-xl md:text-2xl lg:text-3xl font-bold text-[var(--color-forest)] leading-snug"
              />
            </blockquote>
          </div>
        </section>
      </EditableSection>

      {/* ── 영상으로 보기 ── */}
      <EditableSection contentKey="story.video.visibility" page="story" section="video">
        <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
          <div className="max-w-3xl mx-auto">
            <EditableText
              contentKey="story.video.heading"
              defaultValue="영상으로 보기"
              as="h2"
              page="story"
              section="video"
              className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10 text-center"
            />
            <EditableText
              contentKey="story.video.description"
              defaultValue="풍천리 주민들의 7년간의 투쟁과 잣나무 숲을 지키려는 이야기를 영상으로 만나보세요."
              as="p"
              page="story"
              section="video"
              className="text-center text-[var(--color-text-muted)] mb-8 text-base md:text-lg"
            />
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border-2 border-[var(--color-forest)]/15">
              <iframe
                src="https://www.youtube.com/embed/MtmOKKpkGMk"
                title="풍천리 양수발전소 반대 — 생명의 편에 선 당신에게"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </EditableSection>

      {/* ── 풍천리는 어디에 있나요 ── */}
      <EditableSection contentKey="story.location.visibility" page="story" section="location">
        <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg-warm)]">
          <div className="max-w-3xl mx-auto">
            <EditableText
              contentKey="story.location.heading"
              defaultValue="풍천리는 어디에 있나요?"
              as="h2"
              page="story"
              section="location"
              className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10"
            />
            <div className="rounded-2xl overflow-hidden border-2 border-[var(--color-forest)]/15 shadow-sm">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=127.93,37.78,128.04,37.85&layer=mapnik&marker=37.8167,127.9833"
                className="w-full h-[300px] md:h-[400px] lg:h-[450px] border-0"
                loading="lazy"
                title="풍천리 위치 지도"
              />
            </div>
            <EditableText
              contentKey="story.location.description"
              defaultValue="강원도 홍천군 화촌면 풍천리 — 가리산 자락 해발 400~700m 산촌"
              as="p"
              page="story"
              section="location"
              className="mt-4 text-center text-sm md:text-base text-[var(--color-text-muted)]"
            />

            {/* ── 교통 안내 ── */}
            <EditableSection contentKey="story.transport.visibility" page="story" section="transport">
              <div className="mt-12">
                <EditableText
                  contentKey="story.transport.heading"
                  defaultValue="교통 안내"
                  as="h3"
                  page="story"
                  section="transport"
                  className="text-xl md:text-2xl font-bold text-[var(--color-forest)] mb-8 text-center"
                />
                <EditableList
                  contentKey="story.transport.car"
                  defaultItems={[
                    {
                      title: "서울 → 풍천리",
                      route: "서울양양고속도로 → 동홍천IC → 44번 국도 → 화촌면 방면",
                      duration: "약 1시간 30분",
                    },
                    {
                      title: "춘천 → 풍천리",
                      route: "5번 국도 → 홍천 → 44번 국도 → 화촌면 방면",
                      duration: "약 50분",
                    },
                  ]}
                  page="story"
                  section="transport"
                  fields={[
                    { key: "title", label: "구간" },
                    { key: "route", label: "경로" },
                    { key: "duration", label: "소요시간" },
                  ]}
                >
                  {(items) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 자가용 */}
                      <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-[var(--color-forest)]/15 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 rounded-xl bg-[var(--color-forest)]/10 flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-[var(--color-forest)]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 17h.01M16 17h.01M5.2 17H4a1 1 0 01-1-1v-3.6a1 1 0 01.1-.44l1.5-3.2A2 2 0 016.4 7.5h11.2a2 2 0 011.8 1.3l1.5 3.2a1 1 0 01.1.44V16a1 1 0 01-1 1h-1.2M7 17a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z"
                              />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-[var(--color-text)]">
                            자가용
                          </h4>
                        </div>
                        <ul className="space-y-4 text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
                          {items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-forest)]" />
                              <span>
                                <strong className="text-[var(--color-text)]">{item.title}</strong>
                                <br />
                                {item.route}
                                <br />
                                <span className="text-[var(--color-forest)] font-semibold">{item.duration}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 대중교통 — separate list below */}
                      <EditableList
                        contentKey="story.transport.public"
                        defaultItems={[
                          {
                            title: "서울 → 홍천",
                            route: "동서울터미널에서 홍천행 시외버스",
                            duration: "약 1시간 30분, 수시 운행",
                          },
                          {
                            title: "홍천 → 화촌면",
                            route: "홍천버스터미널에서 화촌면행 농어촌버스",
                            duration: "약 40분",
                          },
                          {
                            title: "화촌면 → 풍천리",
                            route: "마을버스 또는 도보",
                            duration: "",
                          },
                        ]}
                        page="story"
                        section="transport"
                        fields={[
                          { key: "title", label: "구간" },
                          { key: "route", label: "경로" },
                          { key: "duration", label: "소요시간" },
                        ]}
                      >
                        {(pubItems) => (
                          <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-[var(--color-forest)]/15 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-10 h-10 rounded-xl bg-[var(--color-forest)]/10 flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-[var(--color-forest)]"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 7v10M16 7v10M6 7h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2zm0 10v2m12-2v2M9 4h6"
                                  />
                                </svg>
                              </div>
                              <h4 className="text-lg font-bold text-[var(--color-text)]">
                                대중교통
                              </h4>
                            </div>
                            <ul className="space-y-4 text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
                              {pubItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-forest)]" />
                                  <span>
                                    <strong className="text-[var(--color-text)]">{item.title}</strong>
                                    <br />
                                    {item.route}
                                    {item.duration && (
                                      <>
                                        <br />
                                        <span className="text-[var(--color-forest)] font-semibold">{item.duration}</span>
                                      </>
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </EditableList>
                    </div>
                  )}
                </EditableList>

                {/* 참고사항 */}
                <EditableList
                  contentKey="story.transport.notes"
                  defaultItems={[
                    { text: "풍천리는 가리산 자락 해발 400~700m 산촌입니다" },
                    { text: "대중교통이 제한적이므로 자가용 이용을 권장합니다" },
                  ]}
                  page="story"
                  section="transport"
                  fields={[{ key: "text", label: "내용" }]}
                >
                  {(noteItems) => (
                    <div className="mt-6 bg-[var(--color-forest)]/5 rounded-2xl p-6 md:p-8 border border-[var(--color-forest)]/10">
                      <h4 className="text-base font-bold text-[var(--color-forest)] mb-4">
                        참고사항
                      </h4>
                      <ul className="space-y-2.5 text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
                        {noteItems.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="shrink-0 mt-1">
                              <svg className="w-4 h-4 text-[var(--color-forest)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
                              </svg>
                            </span>
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5 flex items-start gap-3 bg-white/60 rounded-xl p-4 border border-[var(--color-forest)]/10">
                        <span className="shrink-0 mt-0.5">
                          <svg className="w-5 h-5 text-[var(--color-forest)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </span>
                        <EditableText
                          contentKey="story.transport.carpool"
                          defaultValue="집회 참여 시 카풀이 가능합니다 — 캠페인 페이지에서 문의해주세요"
                          as="p"
                          page="story"
                          section="transport"
                          className="text-sm md:text-base text-[var(--color-text)]"
                        />
                      </div>
                    </div>
                  )}
                </EditableList>
              </div>
            </EditableSection>
          </div>
        </section>
      </EditableSection>

      {/* ── CTA ── */}
      <EditableSection contentKey="story.cta.visibility" page="story" section="cta">
        <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-forest)] text-white text-center">
          <div className="max-w-2xl mx-auto">
            <EditableText
              contentKey="story.cta.heading"
              defaultValue="함께해주세요"
              as="h2"
              page="story"
              section="cta"
              className="text-3xl md:text-4xl font-black mb-6"
            />
            <EditableRichText
              contentKey="story.cta.body"
              defaultValue={`풍천리 주민들의 싸움은 우리 모두의 싸움입니다.\n작은 관심과 참여가 큰 힘이 됩니다.`}
              page="story"
              section="cta"
              className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed"
            >
              {(value) => (
                <p className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed">
                  {value.split("\n").map((line, i) => (
                    <span key={i}>
                      {i > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
              )}
            </EditableRichText>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/petition"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-[var(--color-forest)] font-bold text-lg hover:bg-white/90 transition-colors min-h-[52px]"
              >
                <EditableText
                  contentKey="story.cta.signButton"
                  defaultValue="서명하기"
                  as="span"
                  page="story"
                  section="cta"
                />
              </Link>
              <Link
                href="/donate"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white/15 border-2 border-white/30 text-white font-bold text-lg hover:bg-white/25 transition-colors min-h-[52px]"
              >
                <EditableText
                  contentKey="story.cta.donateButton"
                  defaultValue="후원하기"
                  as="span"
                  page="story"
                  section="cta"
                />
              </Link>
            </div>
          </div>
        </section>
      </EditableSection>
    </article>
  );
}
