import type { Metadata } from "next";
import SubHero from "@/components/SubHero";
import {
  EditableLink,
  EditableText,
  EditableRichText,
  EditableSection,
} from "@/components/editable";
import ManagedSection from "@/components/builder/ManagedSection";
import OrderedSectionGroup from "@/components/builder/OrderedSectionGroup";
import {
  StoryBattleSection,
  StoryDemandsSection,
  StoryReasonsSection,
  StoryTransportSection,
} from "./StorySectionsClient";

export const metadata: Metadata = {
  title: "풍천리 이야기 — 잣나무 숲과 마을을 지키려는 7년간의 싸움",
  description:
    "강원도 홍천군 풍천리 주민들이 양수발전소 건설에 맞서 마을과 자연을 지켜온 이야기를 전합니다.",
};

const STORY_SECTION_ORDER = [
  "hero",
  "village",
  "plant",
  "reasons",
  "battle",
  "demands",
  "video",
  "location",
  "cta",
] as const;

export default function StoryPage() {
  return (
    <article>
      <OrderedSectionGroup page="story" defaultOrder={[...STORY_SECTION_ORDER]}>
      <ManagedSection
        page="story"
        sectionId="hero"
        visibilityContentKey="story.hero.visibility"
        section="hero"
        defaultClassName=""
      >
        <SubHero
          imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg"
          title={<EditableText contentKey="story.hero.title" defaultValue="풍천리 이야기" as="span" page="story" section="hero" />}
          subtitle={<EditableText contentKey="story.hero.subtitle" defaultValue="잣나무 숲과 마을을 지키려는 7년간의 싸움" as="span" page="story" section="hero" />}
          eyebrow="마을의 목소리"
        />
      </ManagedSection>

      <ManagedSection
        page="story"
        sectionId="village"
        visibilityContentKey="story.village.visibility"
        section="village"
        defaultClassName="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]"
      >
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
              renderMode="paragraphs"
              className="space-y-5 text-[var(--color-text)] leading-relaxed text-base md:text-lg"
            />
          </div>
      </ManagedSection>

      <ManagedSection
        page="story"
        sectionId="plant"
        visibilityContentKey="story.plant.visibility"
        section="plant"
        defaultClassName="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg-warm)]"
      >
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
              renderMode="paragraphs"
              className="space-y-5 text-[var(--color-text)] leading-relaxed text-base md:text-lg"
            />
          </div>
      </ManagedSection>

      <ManagedSection
        page="story"
        sectionId="reasons"
        visibilityContentKey="story.reasons.visibility"
        section="reasons"
        defaultClassName=""
      >
        <StoryReasonsSection />
      </ManagedSection>

      <ManagedSection
        page="story"
        sectionId="battle"
        visibilityContentKey="story.battle.visibility"
        section="battle"
        defaultClassName=""
      >
        <StoryBattleSection />
      </ManagedSection>

      <ManagedSection
        page="story"
        sectionId="demands"
        visibilityContentKey="story.demands.visibility"
        section="demands"
        defaultClassName=""
      >
        <StoryDemandsSection />
      </ManagedSection>

      <ManagedSection
        page="story"
        sectionId="video"
        visibilityContentKey="story.video.visibility"
        section="video"
        defaultClassName="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]"
      >
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
      </ManagedSection>

      <ManagedSection
        page="story"
        sectionId="location"
        visibilityContentKey="story.location.visibility"
        section="location"
        defaultClassName="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg-warm)]"
      >
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

            <EditableSection contentKey="story.transport.visibility" page="story" section="transport">
              <StoryTransportSection />
            </EditableSection>
          </div>
      </ManagedSection>

      <ManagedSection
        page="story"
        sectionId="cta"
        visibilityContentKey="story.cta.visibility"
        section="cta"
        defaultClassName="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-forest)] text-white text-center"
      >
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
              renderMode="lines"
              className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed"
            />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <EditableLink
                contentKey="story.cta.signButton.href"
                defaultHref="/petition"
                page="story"
                section="cta"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-[var(--color-forest)] font-bold text-lg hover:bg-white/90 transition-colors min-h-[52px]"
              >
                <EditableText
                  contentKey="story.cta.signButton"
                  defaultValue="서명하기"
                  as="span"
                  page="story"
                  section="cta"
                />
              </EditableLink>
              <EditableLink
                contentKey="story.cta.donateButton.href"
                defaultHref="/donate"
                page="story"
                section="cta"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white/15 border-2 border-white/30 text-white font-bold text-lg hover:bg-white/25 transition-colors min-h-[52px]"
              >
                <EditableText
                  contentKey="story.cta.donateButton"
                  defaultValue="후원하기"
                  as="span"
                  page="story"
                  section="cta"
                />
              </EditableLink>
            </div>
          </div>
      </ManagedSection>
      </OrderedSectionGroup>
    </article>
  );
}
