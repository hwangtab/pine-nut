"use client";

import { useRef, useCallback } from "react";
import { EditableText, EditableImage, EditableList } from "@/components/editable";
import ManagedSection from "@/components/builder/ManagedSection";
import OrderedSectionGroup from "@/components/builder/OrderedSectionGroup";
import HomeCtaSection from "@/components/home/HomeCtaSection";
import HomeHeroSection from "@/components/home/HomeHeroSection";
import { FadeIn } from "@/components/home/HomeMotion";
import HomeShareEditControls from "@/components/home/HomeShareEditControls";
import HomeSocialProofToast from "@/components/home/HomeSocialProofToast";
import { PineTreeIcon } from "@/components/home/HomeVisuals";
import { useHomeSignatureActivity } from "@/components/home/useHomeSignatureActivity";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

const HOME_SECTION_ORDER = [
  "hero",
  "about",
  "impact",
  "hope",
  "quotes",
  "cta",
  "stats",
] as const;


/* ═══════════════════════════════════════════════════════════ */
/*                        PAGE                                */
/* ═══════════════════════════════════════════════════════════ */

export default function HomePage() {
  const { getContent, isEditMode } = useAdminEdit();
  const storyRef = useRef<HTMLDivElement>(null);
  const { signatureCount, setSignatureCount, toastName, toastVisible } =
    useHomeSignatureActivity();
  const toastPrefix = getContent("home.toast.prefix") ?? "방금";
  const toastSuffix = getContent("home.toast.suffix") ?? "님이 서명했습니다";

  const scrollToStory = useCallback(() => {
    storyRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <OrderedSectionGroup page="home" defaultOrder={[...HOME_SECTION_ORDER]}>
      <ManagedSection
        page="home"
        sectionId="hero"
        visibilityContentKey="home.hero.visibility"
        section="hero"
        defaultClassName="relative min-h-[100svh] md:min-h-screen flex flex-col items-center justify-center overflow-hidden text-white px-4 sm:px-6 pt-28 pb-24 sm:pt-32 sm:pb-28 md:pt-36 md:pb-32 text-center"
      >
        <HomeHeroSection onScrollToStory={scrollToStory} />
      </ManagedSection>

      {/* ════════ SECTION 2 — 풍천리를 아시나요? ════════ */}
      <ManagedSection
        page="home"
        sectionId="about"
        visibilityContentKey="home.about.visibility"
        section="about"
        defaultClassName="py-24 md:py-36 px-6 bg-[var(--color-bg-warm)]"
      >
        <div ref={storyRef}>
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <PineTreeIcon className="w-16 h-16 mx-auto mb-8 text-[var(--color-forest)]" />
            </FadeIn>

            <FadeIn delay={0.15}>
              <EditableText
                contentKey="home.about.heading"
                defaultValue="풍천리를 아시나요?"
                as="h2"
                page="home"
                section="about"
                className="text-3xl sm:text-4xl md:text-5xl font-black mb-8 text-[var(--color-forest)]"
              />
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="space-y-6 text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed">
                <EditableText
                  contentKey="home.about.paragraph1"
                  defaultValue="강원도 홍천군 화촌면에 위치한 작은 마을, 풍천리. 산림청 지정 '100대 명품숲', 1,800ha 규모 국내 최대 잣나무 숲에 둘러싸인 가리산 자락의 산촌입니다."
                  as="p"
                  page="home"
                  section="about"
                />
              </div>
            </FadeIn>

            {/* Pine forest photo */}
            <FadeIn delay={0.4}>
              <div className="my-10">
                <EditableImage
                  contentKey="home.about.forestImage"
                  defaultSrc="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/0722/IE003499236_STD.jpg"
                  alt="풍천리 잣나무 숲 실제 풍경"
                  page="home"
                  section="about"
                  width={1200}
                  height={800}
                  className="w-full rounded-2xl shadow-lg"
                />
                <EditableText
                  contentKey="home.about.forestPhotoCredit"
                  defaultValue="사진: 오마이뉴스"
                  as="p"
                  page="home"
                  section="about"
                  className="text-xs text-[var(--color-text-muted)] mt-1"
                />
              </div>
            </FadeIn>

            <FadeIn delay={0.45}>
              <div className="space-y-6 text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed">
                <EditableText
                  contentKey="home.about.paragraph2"
                  defaultValue="주민 약 70%가 잣 생산으로 생계를 유지하는 이 마을은, 숲과 사람이 함께 숨 쉬는 곳입니다."
                  as="p"
                  page="home"
                  section="about"
                />
                <EditableText
                  contentKey="home.about.paragraph3"
                  defaultValue="이 숲에는 산양(천연기념물), 까막딱다구리, 수달 등 멸종위기종이 서식하고 있습니다."
                  as="p"
                  page="home"
                  section="about"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </ManagedSection>

      {/* ════════ SECTION 3 — 무엇이 위협하고 있나요? ════════ */}
      <ManagedSection
        page="home"
        sectionId="impact"
        visibilityContentKey="home.impact.visibility"
        section="impact"
        defaultClassName="py-24 md:py-36 px-6 bg-[var(--color-bg)]"
      >
          <div className="max-w-5xl mx-auto">
            <FadeIn className="text-center mb-16">
              <EditableText
                contentKey="home.impact.heading"
                defaultValue="무엇이 위협하고 있나요?"
                as="h2"
                page="home"
                section="impact"
                className="text-3xl sm:text-4xl md:text-5xl font-black mb-4"
              />
              <EditableText
                contentKey="home.impact.subtitle"
                defaultValue="양수발전소 건설이 풍천리에 가져올 피해"
                as="p"
                page="home"
                section="impact"
                className="text-lg text-[var(--color-text-muted)]"
              />
            </FadeIn>

            <EditableList
              contentKey="home.impact.cards"
              defaultItems={[
                {
                  title: "생태계 파괴",
                  desc: "잣나무 약 11만 그루 벌채 예정, 153ha 산림 파괴. 산양·까막딱다구리·수달 서식지가 사라집니다",
                },
                {
                  title: "소음·분진",
                  desc: "84개월(7년) 공사, 총사업비 1.59조원 규모. 대규모 공사로 고령 주민들의 건강이 위협받습니다",
                },
                {
                  title: "공동체 와해",
                  desc: "51가구 수몰·이주 예정. 수십 년간 이어온 마을 공동체가 해체됩니다",
                },
                {
                  title: "생계 위협",
                  desc: "주민 70%가 잣 생산에 의존. 이미 2024년 10월 이설도로 건설로 2,256그루 벌채가 시작되었습니다",
                },
              ]}
              page="home"
              section="impact"
              fields={[
                { key: "title", label: "제목" },
                { key: "desc", label: "설명", type: "textarea" },
              ]}
            >
              {(items) => {
                const gradients = [
                  "from-emerald-600 to-green-800",
                  "from-gray-500 to-gray-700",
                  "from-amber-700 to-yellow-900",
                  "from-amber-500 to-orange-700",
                ];
                const svgIcons = [
                  <svg key="eco" viewBox="0 0 64 64" fill="none" className="w-14 h-14" aria-hidden="true">
                    <path d="M32 6L18 26h6L14 44h8L10 58h44L42 44h8L40 26h6L32 6z" fill="white" fillOpacity="0.9"/>
                    <rect x="29" y="54" width="6" height="10" rx="1" fill="white" fillOpacity="0.7"/>
                  </svg>,
                  <svg key="noise" viewBox="0 0 64 64" fill="none" className="w-14 h-14" aria-hidden="true">
                    <path d="M10 28v8h8l12 12V16L18 28H10z" fill="white" fillOpacity="0.9"/>
                    <path d="M38 20a12 12 0 010 24" stroke="white" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M42 14a20 20 0 010 36" stroke="white" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="50" cy="18" r="2" fill="white" fillOpacity="0.4"/>
                    <circle cx="54" cy="28" r="1.5" fill="white" fillOpacity="0.3"/>
                    <circle cx="52" cy="40" r="2.5" fill="white" fillOpacity="0.35"/>
                    <circle cx="48" cy="48" r="1.5" fill="white" fillOpacity="0.3"/>
                  </svg>,
                  <svg key="community" viewBox="0 0 64 64" fill="none" className="w-14 h-14" aria-hidden="true">
                    <path d="M8 38L32 18l24 20H8z" fill="white" fillOpacity="0.9"/>
                    <rect x="16" y="38" width="32" height="18" fill="white" fillOpacity="0.9"/>
                    <rect x="26" y="42" width="12" height="14" rx="1" fill="currentColor" fillOpacity="0.3"/>
                    <line x1="18" y1="16" x2="46" y2="52" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="46" y1="16" x2="18" y2="52" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
                  </svg>,
                  <svg key="livelihood" viewBox="0 0 64 64" fill="none" className="w-14 h-14" aria-hidden="true">
                    <ellipse cx="32" cy="40" rx="18" ry="14" fill="white" fillOpacity="0.9"/>
                    <ellipse cx="32" cy="32" rx="18" ry="6" fill="white" fillOpacity="0.7"/>
                    <path d="M24 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="white" strokeOpacity="0.8" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="14" y1="14" x2="50" y2="54" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
                  </svg>,
                ];
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                    {items.map((card, i) => (
                      <FadeIn key={card.title} delay={i * 0.1}>
                        <div className="bg-white rounded-2xl border border-[var(--color-border)] hover:shadow-lg transition-shadow h-full overflow-hidden">
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
                );
              }}
            </EditableList>
          </div>
      </ManagedSection>

      {/* ════════ SECTION 3.5 — 희망/연대 ════════ */}
      <ManagedSection
        page="home"
        sectionId="hope"
        visibilityContentKey="home.hope.visibility"
        section="hope"
        defaultClassName="py-24 md:py-36 px-6 bg-[var(--color-bg-warm)]"
      >
          <div className="max-w-5xl mx-auto">
            <FadeIn className="text-center mb-6">
              <EditableText
                contentKey="home.hope.eyebrow"
                defaultValue="그럼에도 주민들은 포기하지 않았습니다"
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
                defaultValue="7년간 680번의 집회. 70대 어르신들이 매주 버스를 타고 홍천군청까지 갔습니다."
                as="p"
                page="home"
                section="hope"
                className="text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-2xl mx-auto"
              />
            </FadeIn>

            <EditableList
              contentKey="home.hope.cards"
              defaultItems={[
                {
                  title: "672차 기도회",
                  desc: "매주 빠짐없이 모여 평화로운 기도회를 이어왔습니다",
                },
                {
                  title: "140개 단체 연대",
                  desc: "전국의 환경·시민단체가 풍천리와 함께합니다",
                },
                {
                  title: "시민공모전 대상",
                  desc: "한국내셔널트러스트 '이곳만은 지키자' 시민공모전 대상 수상",
                },
              ]}
              page="home"
              section="hope"
              fields={[
                { key: "title", label: "제목" },
                { key: "desc", label: "설명", type: "textarea" },
              ]}
            >
              {(items) => {
                const icons = [
                  <svg key="prayer" viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
                    <path d="M24 4C24 4 14 18 14 26a10 10 0 0020 0C34 18 24 4 24 4z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M24 18v12M20 28l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                  </svg>,
                  <svg key="solidarity" viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
                    <circle cx="24" cy="16" r="6" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                    <circle cx="12" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6"/>
                    <circle cx="36" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6"/>
                    <path d="M16 34c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    <path d="M6 36c0-3.3 2.7-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
                    <path d="M42 36c0-3.3-2.7-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
                  </svg>,
                  <svg key="award" viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
                    <polygon points="24,4 29,18 44,18 32,27 36,42 24,33 12,42 16,27 4,18 19,18" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
                  </svg>,
                ];
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mt-14">
                    {items.map((card, i) => (
                      <FadeIn key={card.title} delay={i * 0.1}>
                        <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] text-center h-full flex flex-col items-center shadow-sm">
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
                );
              }}
            </EditableList>

            {/* Protest photo */}
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
                  className="w-full rounded-2xl shadow-lg"
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
      </ManagedSection>

      {/* ════════ SECTION 4 — 주민들의 목소리 ════════ */}
      <ManagedSection
        page="home"
        sectionId="quotes"
        visibilityContentKey="home.quotes.visibility"
        section="quotes"
        defaultClassName="py-24 md:py-36 px-6 bg-[var(--color-sky)] text-white"
      >
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
                        {/* Large quote mark */}
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
      </ManagedSection>

      {/* ════════ SECTION 5 — 함께해주세요 ════════ */}
      <ManagedSection
        page="home"
        sectionId="cta"
        visibilityContentKey="home.cta.visibility"
        section="cta"
        defaultClassName="py-24 md:py-36 px-6 bg-[var(--color-bg-warm)]"
      >
        <HomeCtaSection
          signatureCount={signatureCount}
          onSignatureCountChange={setSignatureCount}
        />
      </ManagedSection>

      {/* ════════ SECTION 6 — Key Numbers Bar ════════ */}
      <ManagedSection
        page="home"
        sectionId="stats"
        visibilityContentKey="home.stats.visibility"
        section="stats"
        defaultClassName="py-16 md:py-20 px-6 bg-[#0a0a0a] text-white"
      >
          <div className="max-w-6xl mx-auto">
            <EditableList
              contentKey="home.stats.items"
              defaultItems={[
                { number: "2019년~", label: "투쟁 시작" },
                { number: "680회+", label: "집회 횟수" },
                { number: "140개+", label: "연대 단체" },
                { number: "11만+", label: "벌채 예정 잣나무" },
              ]}
              page="home"
              section="stats"
              fields={[
                { key: "number", label: "숫자" },
                { key: "label", label: "라벨" },
              ]}
            >
              {(items) => (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-4 text-center">
                  {items.map((stat, i) => (
                    <FadeIn key={stat.label} delay={i * 0.1}>
                      <div>
                        <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--color-earth-light)] mb-2">
                          {stat.number}
                        </div>
                        <div className="text-sm sm:text-base text-white/50">
                          {stat.label}
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              )}
            </EditableList>
          </div>
      </ManagedSection>

      <HomeSocialProofToast
        visible={toastVisible}
        name={toastName}
        prefix={toastPrefix}
        suffix={toastSuffix}
      />

      {isEditMode && <HomeShareEditControls />}
    </OrderedSectionGroup>
  );
}
