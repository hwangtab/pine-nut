"use client";

import { useCallback, useRef } from "react";
import ManagedSection from "@/components/builder/ManagedSection";
import OrderedSectionGroup from "@/components/builder/OrderedSectionGroup";
import HomeAboutSection from "@/components/home/HomeAboutSection";
import HomeCtaSection from "@/components/home/HomeCtaSection";
import HomeHeroSection from "@/components/home/HomeHeroSection";
import HomeHopeSection from "@/components/home/HomeHopeSection";
import HomeImpactSection from "@/components/home/HomeImpactSection";
import HomeQuotesSection from "@/components/home/HomeQuotesSection";
import HomeShareEditControls from "@/components/home/HomeShareEditControls";
import HomeSocialProofToast from "@/components/home/HomeSocialProofToast";
import HomeStatsSection from "@/components/home/HomeStatsSection";
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

      <ManagedSection
        page="home"
        sectionId="about"
        visibilityContentKey="home.about.visibility"
        section="about"
        defaultClassName="py-24 md:py-36 px-6 bg-[var(--color-bg-warm)]"
      >
        <HomeAboutSection storyRef={storyRef} />
      </ManagedSection>

      <ManagedSection
        page="home"
        sectionId="impact"
        visibilityContentKey="home.impact.visibility"
        section="impact"
        defaultClassName="py-24 md:py-36 px-6 bg-[var(--color-bg)]"
      >
        <HomeImpactSection />
      </ManagedSection>

      <ManagedSection
        page="home"
        sectionId="hope"
        visibilityContentKey="home.hope.visibility"
        section="hope"
        defaultClassName="py-24 md:py-36 px-6 bg-[var(--color-bg-warm)]"
      >
        <HomeHopeSection />
      </ManagedSection>

      <ManagedSection
        page="home"
        sectionId="quotes"
        visibilityContentKey="home.quotes.visibility"
        section="quotes"
        defaultClassName="py-24 md:py-36 px-6 bg-[var(--color-sky)] text-white"
      >
        <HomeQuotesSection />
      </ManagedSection>

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

      <ManagedSection
        page="home"
        sectionId="stats"
        visibilityContentKey="home.stats.visibility"
        section="stats"
        defaultClassName="py-16 md:py-20 px-6 bg-[#0a0a0a] text-white"
      >
        <HomeStatsSection />
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
